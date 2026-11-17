# Lecture 8 - Mechanism of Address Translation

Suppose we have written a C program that initializes a variable and adds a constant to it. This code is converted into an assembly code, each instruction having an address. The virtual address space is set up by the OS during process creation.

> Can we use heap from an assembly code?

The OS places the memory images in various chunks (need not be contiguous). However, we shall be considering a simplified version of an OS where the entire memory image is placed in a single chunk. We need the OS to access the physical memory given the virtual address. Also, the OS must detect an error if a program tries to access the memory that is outside the bounds.

## Who performs address translation?

In this simple example, the OS can tell the hardware the base and the bound/size values. The MMU calculates PA from VA. The OS is **not involved** in every translation!

Basically, the CPU provides a privileged mode of execution. The instruction set has privileged instructions to set translation information (e.g., base, bound). We don't want the user programs to be able to set this information. Then, the MMU uses this information to perform translation on every memory access. The MMU also generates *faults* and *traps* to OS when an access is illegal.

## Role of OS

What does the OS do? The OS maintains a free list of memory. It allocates spaces to process during creation and cleans up when done. The OS also maintains information of where space is allocated to each process in PCBs. This information is provided to the hardware for translation. Also, the information has to be **updated on context switch** in the MMU. Finally, the OS handles traps due to illegal memory access.

## Segmentation

The base and bound method is a very simple method to store the memory image. Segmentation is a generalized method to store each segment of the memory image separately. For example, the base/bound values of the heap, stack, etc., are stored in the MMU. However, segmentation is not popularly used. Instead, paging is used widely.

Segmentation is suitable for sparse address spaces.

> Stack and heap grow in the physical address space?

Although, segmentation uses variable-sized allocation, which leads to **external fragmentation** - small holes in the memory left unused.