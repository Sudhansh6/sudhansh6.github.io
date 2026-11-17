# Lecture 11 - Memory Allocation Algorithms

Let us first discuss the problems with variable/dynamic size allocation. This is done from the C library - allocates one or more pages from the kernel via `brk/sbrk` `mmap` system calls. The user may ask for variable-sized chunks of memory and can arbitrarily free the used memory. The C library and the kernel (for its internal data structures) must take care of all this.

## Variable sized allocation - Headers

Consider a simple implementation of `malloc`. An available chunk of memory is allocated on request. Every assigned piece has a header with info like chunk size, checksum/some magic number, etc. Why store size? We should know how much memory to free when `free` is called.

## Free List

How is the free space managed? It is usually handled as a list. The library keeps track of the head of the list. The pointer to the next free chunk is embedded within the current head. Allocations happen from the head. 

## External Fragmentation

Suppose  3 allocations of size 100 bytes each happen. Then, the middle chunk pointed to by `sptr` is freed. How is the free list updated? It now has two non-contiguous elements. The free space may be scattered around due to fragmentation. Therefore, we cannot satisfy a request for 3800 bytes even though we have free space. This is the primary problem of variable allocation.

**Note.** The list is updated to account for the newly freed space. That is, the head is revised to point to `sptr`, and the list is updated accordingly. Don't  be under the false impression that we are missing out on free space.

## Splitting and Coalescing

Suppose we have a bunch of adjacent free chunks. These chunks may not be adjacent in the list. If we had started out with a big free piece, we might end up with small tangled chunks. We need an algorithm that merged all the contiguous free fragments into a bigger free chunk. We must also be able to split the existing free pieces to satisfy the variable requests.

### Buddy allocation for easy coalescing

Allocate memory only in sizes of power of 2. This way, 2 adjacent power-of-2 chunks can be merged to form a bigger power-of-2 chunk. That is, buddies can be combined to form bigger pieces.

## Variable Size Allocation Strategies

**First Fit** - Allocate the first chunk that is sufficient

**Best Fit** - Allocate the free chunk that is closest in size to the request.

**Worst Fit** - Allocate the free chunk that is farthest in size. Sounds odd? It's better sometimes as the remaining free space in the chunk is large and is more usable.  For example, the best fit might allocate a 20-byte chunk for a malloc(15), and the worst might give a 100-byte chunk for the same call. Now, the 85-byte free space is more usable than the 5-byte free space.

> Do we use this in the case of buddy allocation?

## Fixed Size allocations

Fixed-size allocations are much simpler as they avoid fragmentation and various other problems. The kernel issues fix **page-sized** allocations. It maintains a free list of pages, and the pointer to the following free page is stored in the current free page itself. What about smaller allocations (e.g., PCB)? The kernel uses a **slab allocator**. It maintains **object caches** for each type of object. Within each cache, only fixed size allocation is done. Each cache is made up of one or more *slabs*. Within a page, we have fixed size allocations again. 

Fixed size memory allocators can be used in user programs too. `malloc` is a generic memory allocator, but we can use other methods too.