# Lecture 27 - Virtual Memory  and paging in xv6

We have a 32-bits version on xv6; thereby, we have $$2^{32} = $$ 4GB virtual address space for every process. The process address space is divided into pages (4KB by default). Every valid **logical** page used by the process is mapped to a physical frame by the OS (no demand paging). There is a single page table entry per page containing the physical frame number (**PFN**) and various flags/permissions for the page.

## Page table in xv6

There can be up to $$2^{20}$$ page table entries for a process with the properties we have described above. Each PTE has a 20-bit physical frame number and some flags

- `PTE_P` indicates if a page is present. If not set, access will cause a page fault.
- `PTE_W` indicates if writable. If not set, only reading is permitted
- `PTE_U` indicates if user page. If not set, only the kernel can access the page.

Address translation is done via the page number (top 20 bits of a virtual address) to index into the page table, find the PFN, add a 12-bit offset (for navigating inside the frame).

## Two-level page table

All the $$2^{20}$$ entries can't be stored contiguously. Therefore, the page table in xv6 has two levels. We have $$2^{10}$$ *inner* page tables pages, each with $$2^{10}$$ PTEs. The *outer* page director stores PTE-like references to the $$2^{10}$$ inner page tables. The physical address of the outer page directory is stored in the CPU's `cr3` register, which is used by the MMU during address translation.

```
A virtual address ’la’ has a three−part structure as follows:
+−−−−−−−−10−−−−−−+−−−−−−−10−−−−−−−+−−−−−−−−−12−−−−−−−−−−+
| Page Directory | Page Table | Offset within Page |
| 	  Index	     |   Index    |					   |
+−−−−−−−−−−−−−−−−+−−−−−−−−−−−−−−−−+−−−−−−−−−−−−−−−−−−−−−+
\−−− PDX(va) −−/ \−−− PTX(va) −−/
```

Therefore, we now have 32-bit virtual addresses.

## Process virtual address space in xv6

The memory image of a process starting at address 0 has the following: code/data  from the executable, *fixed*-size stack with **guard page** (to prevent overflowing), expandable heap. This is how the user part of the process is organized.

The process space also has the kernel code/data beginning at the address `KERNBASE (2GB)`. This part contains kernel code/data, free pages maintained by the kernel, and some space reserved for the I/O devices.

The page table of a process contains two sets of PTEs.  

- The user entries map low virtual addresses to the physical memory sued by the process for its code/data/stack/heap.
- The kernel entries map high virtual addresses to physical memory containing OS code and data structures. These entries are identical across all processes. 

A process can only access memory mapped by its own page table. 

## OS page table mappings

The OS code/data structures are a part of the virtual address space of every process. The page table entries map high virtual addresses (2GB to 2GB + `PHYSTOP`) to OS code/data in physical memory (~0 to `PHYSTOP`). This part contains the kernel code/data, I/O devices, and primarily free pages. Note that there is only a single copy of OS code in memory, mapped into all process page tables. 

Can't we directly access the OS code using its physical address? No. With paging and MMU, the physical memory can only be accessed by assigning a virtual address.  During a trap, the same page table can be used to access the kernel. If the OS is not a part of the virtual address space, we would have had to use a new page table during trap which is cumbersome (?).

Some of the aforementioned free pages in the OS memory are assigned to processes. Suppose a physical frame P is initially mapped into the kernel part of the address space at virtual address V ( we will have V = P + `KERNBASE`). When assigned to a user process, this piece of memory is assigned another virtual address U (< `KERNBASE`). This is because a user cannot utilize this free page unless the PTE is in the userspace. Hence, the same frame P is mapped twice into the page table! The kernel and user access the same memory using different virtual addresses.

> What is going on above?

Every byte of RAM can consume 2 bytes of virtual address space, so xv6 cannot use more than 2GB of RAM. Actual kernels deal with this better. For example, the kernel page is deleted when a user page is created.

## Maintaining free memory

After bootup, RAM contains the OS code/data and free pages. The OS collects all the free pages into a free list called `run` to be assigned to the user processes. This free list is a linked list, and the pointer to the next free page is embedded within the previous free page.

Any process that needs a free page uses `kalloc()` to get a free page. Memory is freed up using `kfree()`. We need to add  the free page to the head of the free list and update the free list pointer. Take a look at the codes for this part.

## Summary of virtual memory in xv6

xv6 only has virtual addressing, no demand paging. There is a 2 tier page table, outer `pgdir`, and inner pages tables. The process address space has 

- User memory image at low virtual addresses
- Kernel code/data mapped at high virtual addresses. 