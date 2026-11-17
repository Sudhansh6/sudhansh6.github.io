# Lecture 9 - Paging

The memory image of a process is split into fixed-size chunks called **pages**. Each of these pages is mapped to a **physical frame** in the memory. This method avoids external fragmentation. Although, there might be **internal fragmentation**. This is because sometimes the process requires much less memory than the size of a page, but the OS allocates memory in fixed-size pages. However, internal fragmentation is a small problem.

## Page Table

This is a data structure specific to a process that helps in VA-PA translation. This structure might be as simple as an array storing mappings from virtual page numbers (VPN) to physical frame numbers (PFN). This structure is stored as a part of the OS memory in PCB. The MMU has access to the page tables and uses them for address translation. The OS has to update the page table given to the MMU upon a context switch.

## Page Table Entry (PTE)

The most straightforward page table is a linear page table, as discussed above. Each PTE contains PFN and a few other bits

- Valid bit - Is this page used by the process?
- Protection bits - Read/write permissions
- Present bit - Is this page in memory? (will be discussed later)
- Dirty bit - Has this page been modified?
- Accessed bit - Has this page been recently accessed?

## Address translation in hardware

A virtual address can be separated into VPN and offset. The most significant bits of the VA are the VPN. The page table maps VPN to PFN. Then, PA is obtained from PFN and offset within a page. The MMU stores the (physical) address of the start of the page table, not all the entries. The MMU has to walk to the relevant PTE in the page table.

Suppose the CPU requests code/data at a virtual address. Now, the MMU has to access the physical memory to fetch code/data. As you can see, paging adds *overhead* to memory access. We can reduce this overhead by using a cache for VA-PA mappings. This way, we need not go to the page table for every instruction. 

## Translation Lookaside Buffer (TLB)

Ignore the name. Basically, it's a cache of recent VA-PA mappings. To translate VA to PA, the MMU first looks up the TLB. If the TLB misses, the MMU has to walk the page table. TLB misses are expensive (in the case of multiple memory accesses). Therefore, a **locality of reference** helps to have a high hit rate. For example, a program may try to fetch the same data repeatedly in a loop.

**Note.** TLB entries become invalid on context switch and change of page tables.

> Page table can change without context switch?

Also, this cache is not taken care of by the OS but by the architecture itself.

## How are page tables stored in the memory?

A typical page table has 2^20 entries in a 32-bit architecture (32 bit VA) and 4KB pages

```
2^32 (4GB RAM)/ 2^12 (4KB pages)
```

If each PTE is 4 bytes, then page table is 4MB! How do we reduce the size of page tables? We can use large pages. Still, it's a tradeoff.

How does the OS allocate memory for such large tables? The page table is itself split into smaller chunks! This is a **multilevel page table**.

## Multilevel page tables

A page table is spread over many pages. An "outer" page table or **page directory** tracks the PFNs of the page table pages. If a page directory can't fit in a single page, we may use more than 2 levels. For example, 64-bit architectures use up to 7 levels!

How is the address translation done in this case? The first few bits of the VA identify the outer page table entry. The next few bits are used to index into the next level of PTEs.

What about TLB misses? We need to perform multiple access to memory required to access all the levels of page tables. This is a lot of overhead!