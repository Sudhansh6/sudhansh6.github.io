# Lecture 24 - Trap Handling

What is a trap? In certain scenarios, the user programs have to *trap* into the OS/kernel code. The following events cause a user process to "trap" into the kernel (xv6 refers to these events as traps)

- System calls - requests by user for OS services
- Interrupts - External device wants attention
- Program fault - Illegal action by a program

When any of the above events happen, the CPU executes the special *`int`* instruction. The user program is blocked. A trap instruction has a parameter `int n`, indicating the type of interrupt. For example, syscall has a different value for $$n$$ from a keyboard interrupt. 

Before the trap instruction is executed, `eip` points to the user program instruction, and `esp` to user stack. When an interrupt occurs, the CPU executes the following step s as part of the `int n` instruction -

- Fetch the $$n$$th entry interrupt descriptor table (CPU knows the memory address of IDT)
- Save stack pointer (`esp`) to an internal register
- Switch `esp` to the kernel stack of the process (CPU knows the location of the kernel stack of the current process - ***task state segment***)
- On the kernel stack, save the old `esp`, `eip`, etc.
- Load the new `eip` from the IDT, which points to the kernel trap handler.

Now, the OS is ready to run the kernel trap handler code on the process's kernel stack. Few details have been omitted above -

- Stack, code segments (`cs`, `ss`), and a few other registers are also saved.
- Permission check of CPU privilege levels in IDT entries. For example, a user code can invoke the IDT entry of a system call but not of a disk interrupt.
- Suppose an interrupt occurs when the CPU is already handling a previous interrupt. In that case, we don't have to save the stack pointer again.

## Why a separate trap instruction?

Why can't we simply jump to kernel code, like we jump to the code of a function in a function call? The reasons are as follows -

- The CPU is executing the user code at a lower privilege level, but the OS code must run at a higher privilege.
- The user program cannot be trusted to invoke kernel code on its own correctly.
- Someone needs to change the CPU privilege level and give control to the kernel code.
- Someone also needs to switch to the secure kernel stack so that the kernel can start saving the state.

## Trap frame on the kernel stack

**Trap frame** refers to the state pushed on the kernel stack during trap handling. This state includes the CPU context of where execution stopped and some extra information needed by the trap handler. The `int n` instruction pushes only the bottom few entries of the trap frame. The kernel code pushes the rest.

## Kernel trap handler (`alltraps`)

The IDT entries for all interrupts will set `eip` to point to the kernel trap handler `alltraps`. The `alltraps` assembly code pushes the remaining registers to complete the trap frame on the kernel stack. `pushal` pushes all the general-purpose registers. It also invokes the C trap handling function named `trap`. The top of the trap frame (current top of the stack - `esp`) is given as an argument to the C function.

The convention of calling C functions is to push the arguments on to the stack and then call the function. 

## C trap handler function

The C trap handler performs different actions based on the kind of trap. For example, say we have to execute a system call. The function invokes `int n`. The system call number is taken from the register `eax` (whether fork, exec, etc.). The return value of the syscall is stored in `eax` after execution.

Suppose we have an interrupt from a device; the corresponding device-related code is called. The trap number is different for different devices. A timer interrupt is a special hardware interrupt, and it is generated periodically to trap to the kernel. On a timer interrupt, a process `yield`s CPU to the scheduler. This interrupt ensures a process does not run for too long.

## Return from trap

The values from the kernel stack have to be popped. The return from trap instruction `iret` does the opposite of `int`. It pops the values and changes the privilege level back to a lower level. Then, the execution of the pre-trap code can resume.

## Summary of xv6 trap handling

- System calls, program faults, or hardware interrupts cause the CPU to run `int n` instruction and "trap" to the OS.
- The trap instruction causes the CPU to switch `esp` to the kernel stack, `eip` to the kernel trap handling code.
- The pre-trap CPU state is saved on the kernel stack in the trap frame. This is done both by the `int` instruction and the `alltraps` code.
- The kernel trap handler handles the trap and returns to the pre-trap process.