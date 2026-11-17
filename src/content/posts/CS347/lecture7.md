# Lecture 7 - Introduction to Virtual memory

The OS provides a virtualized view of the memory to a user process. Why do we need to do this? Because the real view of memory is messy! In the olden days, the memory had only the code of one running process and the OS code. However, the contemporary memory structure consists of multiple active processes that timeshare the CPU. The memory of a single process need not be contiguous.

 The OS hides these messy details of the memory and provides a clean abstraction to the user.

## The Abstraction: (Virtual) Address Space

Every process assumes it has access to a large space of memory from address - to a MAX value. The memory of a process, as we've seen earlier, has code (and static data), heap (dynamic allocations), and stack (function calls). Stack and heap of the program grow during **runtime**. The CPU issues "loads" and "stores" to these virtual addresses. For example, when you print the address of a variable in a program, you get the virtual addresses!

## Translation of addresses

The OS performs the address translation from virtual addresses (VA) to physical addresses (PA) via a memory hardware called **Memory Management Unit (MMU)**. The OS provides the necessary information to this unit. The *CPU loads/stores to VA*, but the memory hardware accesses PA. 

## Example: Paging

This is a technique used in all modern OS. The OS divides the virtual address space into fixed-size **pages**, and similarly, the physical memory is segmented into **frames**. To allocate memory, a *page* is mapped to a free physical frame. The **page table** stores the mappings from the virtual page number to the physical frame number for a process. The MMU has access to these page tables and uses them to translate VA to PA.

## Goals of memory virtualization

- Transparency - The user programs should not be aware of the actual physical addresses.
- Efficiency - Minimize the overhead and wastage in terms of memory space and access time.
- Isolation and Protection - A user process should not be able to access anything outside its address space.

## How can a user allocate memory?

The OS allocates a set of pages to the memory image of the process. Within this image

- Static/global variables are allocated in the executable.
- Local variables of a function are allocated during runtime on the stack.
- Dynamic allocation with `malloc` on the heap.

Memory allocation is done via system calls under the hood. For example, `malloc` is implemented by a C library that has algorithms for efficient memory allocation and free space management. 

When the program runs out of the initially allocated space, it *grows* the heap using the `brk/sbrk` system call. Unlike `fork`, `exec`, and `wait`, the programmer is discouraged from using these system calls directly in the user code. 

A program can also allocate a page-sized memory using the `mmap()` system call and get an *anonymous* (empty, will be discussed later) page from the OS.

## A subtlety in the address space of the OS

Where is the OS code run? OS is not a separate process with its own address space.  Instead, the OS code is a part of the address space of every process. A process sees OS as a part of its code! In the background, the OS provides this abstraction. However, in reality, the page tables map the OS addresses to the OS code. 

Also, the OS needs memory for its data structures. How does it allocate memory for itself? For large allocation, the OS allocates itself a page. For smaller allocations, the OS uses various memory allocation algorithms (will be discussed later). **Note.** The OS cannot use `libc` and `malloc` in the kernel.

> Why?

