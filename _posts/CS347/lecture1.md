# Lecture 1 - Introduction

## What is an operating system?

An operating system is a **middleware** between user programs and system hardware.

|            User Programs             |
| :----------------------------------: |
|                **OS**                |
| **Hardware**: CPU, Memory, Disk, I/O |

An operating system manages hardware: CPU, Main Memory, IO devices (disk, network, card, mouse, keyboard, etc.)

## What happens when you run a program? (Background)

A compiler translated high level programs into an ***executable*** (".c" to "a.out")

The executable contains instructions that the CPU can understand and the program's data (all numbered with addresses).

Instructions run on CPU: hardware implements an ***Instruction Set Architecture*** (ISA).

CPU also consists of a few registers, e.g., 

- Pointer to current instruction (PC)
- Operands of the instructions, memory addresses

To run an exe, the CPU does the following:

1. Fetches instruction 'pointed at' by PC from memory
2. Loads data required by the instructions into registers
3. Decodes and executes the instruction
4. Stores the results to memory

Most recently used instructions and data are in CPU **cache** (instruction cache and data cache) for faster access.

## What does the OS do?

### OS manages CPU

It initializes program counter (PC) and other registers to begin execution. OS provides the **process abstraction**. 

> Process: A running program

OS creates and manages processes. Each process has the illusion of having the complete CPU, i.e., OS ***virtualizes*** CPU. It *timeshares* the CPU between processes. It also enables coordination between processes.

### OS manages memory

It loads the program executable (code, data) from disk to memory. It has to manage code, data, stack, heap, etc. Each process thinks it has a dedicated memory space for itself, numbers code, and data starting from 0 (**virtual addresses**).

The operating system abstracts out the details of the actual placement in memory, translates from virtual addresses to real physical addresses.

Hence, the process does not have to worry about where its memory is allocated in the physical space. 

### OS manages devices

OS helps in reading/writing files from the disk. OS has code to manage disk, network card, and other external devices: ***device drivers***. 

> Device driver: Talks the language of the hardware devices.
>
> It issues instructions to devices (fetching data from a file). It also responds to interrupt events from devices (pressing a key on the keyboard).

The persistent (ROM) data is organised as a ***file system*** on the disk.

## Design goals of an operating system

- **Convenience**, **abstraction of hardware** resources for user programs.
- **Efficiency** of usage of CPU, memory, etc.
- **Isolation** between multiple processes.

## History of operating systems

OS started out as a library to provide common functionality across programs. Later, it evolved from procedure calls to ***system calls***.

When a system call is made to run OS code, the CPU executes at a *higher privilege level*.

OS evolved from running a single program to executing *multiple processes concurrently*.