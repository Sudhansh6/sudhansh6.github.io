# Lecture 28 - Memory Management of user processes in xv6

The user process needs memory pages to build its address space. Every process requires memory for memory image and page table. The free list of the kernel allocates this memory using `kalloc`. The new virtual address space for a process is created during `init` process creation, `fork` system call, and `exec` system call. The existing virtual address space is modified using the `sbrk` system call (to expand heap). The page table is constructed in the following manner:

- We start with a single page for the outer page directory
- We allocate inner page tables as and when needed.

## Functions to build page table

Every page table begins setting up the kernel mappings in `setupkvm`. The outer `pgdir` is allocated. The kernel mappings defined in `kmap` are added to the page table by calling `mappages`. After `setupkvm`, user page table mappings are added.

```c
// This table defines the kernel’s mappings, which are present in
// every process’s page table.
static struct kmap {
    void *virt;
    uint phys_start;
    uint phys_end;
    int perm;
} kmap[] = {
    { (void*)KERNBASE, 0,	EXTMEM, 	PTE_W}, // I/O space
    { (void*)KERNLINK, V2P(KERNLINK),	V2P(data), 	0}, // kern text + rodata
    { (void*)data,	V2P(data),	PHYSTOP, 	PTE_W}, // kern data + memory
    { (void*)DEVSPACE, DEVSPACE,	0, 	PTE_W}, // more devices
};

// Set up kernel part of a page table.
pde_t*
setupkvm(void)
{
    pde_t *pgdir;
    struct kmap *k;
    if((pgdir = (pde_t*)kalloc()) == 0)
        return 0;
    memset(pgdir, 0, PGSIZE);
    if (P2V(PHYSTOP) > (void*)DEVSPACE)
        panic("PHYSTOP too high");
    for(k = kmap; k < &kmap[NELEM(kmap)]; k++)
        if(mappages(pgdir, k−>virt, k−>phys_end − k−>phys_start,
        (uint)k−>phys_start, k−>perm) < 0) {
            freevm(pgdir);
            return 0;
        }
    return pgdir;
}
```

The page table entries are added by `mappages`. The arguments are page directory, range of virtual addresses, physical addresses to map to, and permissions of the pages. This function walks the page table for each page, gets the pointer to PTE via the function `walkpgdir`, and fills it with physical address and permissions.  The function `walkpgdir` walks the page table and returns the PTE of a virtual address. 

```c
// Return the address of the PTE in page table pgdir
// that corresponds to virtual address va. If alloc!=0,
// create any required page table pages.
static pte_t *
walkpgdir(pde_t *pgdir, const void *va, int alloc)
{
    pde_t *pde;
    pte_t *pgtab;
    pde = &pgdir[PDX(va)];
    if(*pde & PTE_P){
        pgtab = (pte_t*)P2V(PTE_ADDR(*pde));
    } else {
        if(!alloc || (pgtab = (pte_t*)kalloc()) == 0)
            return 0;
        // Make sure all those PTE_P bits are zero.
        memset(pgtab, 0, PGSIZE);
        // The permissions here are overly generous, but they can
        // be further restricted by the permissions in the page table
        // entries, if necessary.
        *pde = V2P(pgtab) | PTE_P | PTE_W | PTE_U;
    }
    return &pgtab[PTX(va)];
}
// Create PTEs for virtual addresses starting at va that refer to
// physical addresses starting at pa. va and size might not
// be page−aligned.
static int
mappages(pde_t *pgdir, void *va, uint size, uint pa, int perm)
{
    char *a, *last;
    pte_t *pte;
    a = (char*)PGROUNDDOWN((uint)va);
    last = (char*)PGROUNDDOWN(((uint)va) + size − 1);
    for(;;){
        if((pte = walkpgdir(pgdir, a, 1)) == 0)
            return −1;
        if(*pte & PTE_P)
            panic("remap");
        *pte = pa | perm | PTE_P;
        if(a == last)
            break;
        a += PGSIZE;
        pa += PGSIZE;
    }
    return 0;
}
```

## Fork: copying the memory image

The `copyuvm` function is called by the parent to copy the parent's memory image to the child. Check out `fork`'s code [here](#fork-system-call). This function starts out by creating a new page table for the child. Then, it has to walk through the parent's memory image page by page and copy it to the child while adding the child page table mappings.

```c
copyuvm(pde_t *pgdir, uint sz)
{
    pde_t *d;
    pte_t *pte;
    uint pa, i, flags;
    char *mem;
    if((d = setupkvm()) == 0)
        return 0;
    for(i = 0; i < sz; i += PGSIZE){
        if((pte = walkpgdir(pgdir, (void *) i, 0)) == 0)
            panic("copyuvm: pte should exist");
        if(!(*pte & PTE_P))
            panic("copyuvm: page not present");
        pa = PTE_ADDR(*pte);
        flags = PTE_FLAGS(*pte);
        if((mem = kalloc()) == 0)
            goto bad;
        memmove(mem, (char*)P2V(pa), PGSIZE);
        if(mappages(d, (void*)i, PGSIZE, V2P(mem), flags) < 0) {
            kfree(mem);
            goto bad;
        }
    }
    return d;
    bad:
        freevm(d);
        return 0;
}
```

For each page in the parent, 

- We fetch the PTE and gets its physical address and permissions
- We allocate a new page for the child and copy the parent's page's contents to the child's new page.
- Then, we add a PTE from the virtual address to the physical address of the new page in the child page table.

Real operating systems do copy-on-write fork - The child page table also points to the parent pages until either of them modifies the pages. Here, xv6 creates separate memory images for the parent and the child right away.

## Growing memory image - `sbrk`

Initially, the heap of a process is empty, and the program *break* is at the end of the stack. The `sbrk` system call is invoked by `malloc` to expand the heap. The `allocuvm` allocates new pages and adds mappings into the page table for the new pages to grow memory.  Whenever the page table is updated, we must update the `cr3` register and TLB (using `switchuvm`).

The `allocuvm` function walks through the new virtual addresses to be added in the page-sized chunks.

## Exec System call

Refer to the code in xv6 documentation. It reads the ELF (the new executable) binary file from the disk into memory. It starts with a new page table and adds mappings to the new executable pages to grow the virtual address space. So far, it hasn't overwritten the old page table. Once the executable is copied to the memory image, we allocate 2 pages for stack (1 for guard page whose permissions are cleared, and upon accessing will trap). All the `exec` arguments are pushed on the user stack for the main function of the new program.

If no errors have occurred so far, we switch to the new page table. We set `eip` in trapframe to start at the entry point of the new program.