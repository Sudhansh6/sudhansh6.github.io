# Lecture 4 - Mechanism of process execution

In this lecture, we will learn how an OS runs a process. How it handles system calls, and how it context switches from one process to the other. We are going to understand the low-level mechanisms of these.

## Process Execution

The first thing the OS does is, it allocates memory and create a memory image. It also sets up the program counter and other registers. After the setup, the OS is out of the way, and the process executes directly on the CPU **by itself**.

## A simple function call

A function call translates to a **`jump`** instruction. A new stack frame is pushed onto the stack, and the stack pointer (SP) is updated. The old value of the PC (return value) is pushed to the stack, and the PC is updated. The stack frame contains return value, function arguments, etc.

## How is a system call different?

The CPU hardware has multiple privilege levels. The *user mode* is used to run the user code. OS code like the system calls run in the *kernel mode*. Some instructions execute only in kernel mode.

The kernel does not trust the user stack. It uses a separate kernel stack when in kernel mode. The kernel also does not trust the user-provided addresses. It sets up an ***Interrupt Descriptor Table (IDT)*** at boot time. The IDT has addresses of kernel functions to run for system calls and other events.

## Mechanism of a system call: trap instruction

A special trap instruction is run when a system call must be made (usually hidden from the user by libc). The trap instruction initially moves the CPU to a high privilege level. The stack pointer is updated to switch to the kernel stack. Here, the context, such as old PC, registers, etc., is saved. Then, the address of the system call is looked up in the IDT, and the PC jumps to the trap handler function in the OS code.

The trap instruction is executed on the hardware in the following cases - 

- System call - Program needs OS service
- Program faults - Program does something illegal, e.g., access memory that it doesn't have access to
- Interrupt events - External device needs the attention of OS, e.g., a network packet has arrived on the network card.

In all of the cases, the mechanism is the same as described above. The IDT has many entries. The system calls/interrupts store a number in a CPU register before calling trap to identify which IDT entry to use.

When the OS is done handling the syscall or interrupt, it calls a special instruction called **`return-from-trap`**. It undoes all the actions done by the trap instruction. It restores the context of CPU registers from the kernel stack. It changes the CPU privilege from kernel mode to user mode, and it restores the PC and jumps to user code after the trap call.

The user process is unaware that it was suspended, and it resumes execution as usual. 

Before returning to the user mode, the OS checks if it has to switch back to the same process or another process. Why do we want to do this? Sometimes when the OS is in kernel mode, it cannot return back to the same process it left. For example, when the original process has exited, it must be terminated (e.g., due to a segfault) or when the process has made a blocking system call. Sometimes, the OS does not want to return back to the same process. Maybe the process has run for a long time, Due to the timesharing responsibility, the OS switches to another process. In such cases, OS is said to perform a ***context switch*** to switch from one process to another.

## OS scheduler

The OS scheduler is responsible for the context switching mechanism. It has two parts - A policy to pick which process to run and a mechanism to switch to that process. There are two different types of schedulers.

A non-preemptive (cooperative) scheduler is polite. It switches only when a process is blocked or terminated. On the other hand, a preemptive (non-cooperative) schedulers can switch even when the process is ready to be continued. The CPU generates a **periodic timer interrupt** to check if a process has run for too long. After servicing an interrupt, a preemptive scheduler switches to another process. 

## Mechanism of context switch

Suppose a process A has moved from the user to kernel mode, and the OS decides it must switch from A to B. Now, the OS's first job is saving the context (PC, registers, kernel stack pointer) of A on the kernel stack. Then, the kernel stack pointer is switched to B, and B's context is restored from B's kernel stack. This context was saved by the OS when it switched out of B in the past. Now, the CPU is running B in kernel mode, `return-from-trap` to switch to user mode of B.

## A subtlety on saving context

The context (PC and other registers) of a process is saved on the kernel stack in two different scenarios.

When the OS goes from user mode to kernel mode, user context (e.g., which instruction of user code you stopped at) is saved on the kernel stack by the trap instruction. This is later restored using the `return-from-trap` instruction. The other scenario where you store the context is during a context switch. The kernel context (e.g., where you stopped in the OS code) of process A is saved on the kernel stack of A by the context-switching code, and B's context is restored.