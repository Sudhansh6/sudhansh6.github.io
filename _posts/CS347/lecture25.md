# Lecture 25 - Context Switching

Before we understand context switching, we need to understand the concepts related to processes and schedulers in xv6. In xv6, every CPU has a attribute called a **scheduler thread**. It is a special process that runs the scheduler code. The scheduler goes over the list of processes and switches to one of the runnable processes. after running for sometime, the process switches back to the scheduler thread. This can happen in the following 2 ways -

- Process has terminated
- Process needs to sleep
- Process _yields_ after running for a long time

A context switch only happens when the process is already **in the kernel mode**.

## Scheduler and sched

The scheduler switches to a user process in the `scheduler` function. User processes switch to the scheduler thread in the `sched` function (invoked from `exit`, `sleep`, `yield`). 

```c
void
scheduler(void)
{
    struct proc *p;
    struct cpu *c = mycpu();
    c−>proc = 0;
    for(;;){
        // Enable interrupts on this processor.
        sti();
        // Loop over process table looking for process to run.
        acquire(&ptable.lock);
        for(p = ptable.proc; p < &ptable.proc[NPROC]; p++){
            if(p−>state != RUNNABLE)
                continue;
            // Switch to chosen process. It is the process’s job
            // to release ptable.lock and then reacquire it
            // before jumping back to us.
            c−>proc = p;
            switchuvm(p);
            p−>state = RUNNING;
            swtch(&(c−>scheduler), p−>context);
            switchkvm();
            // Process is done running for now.
            // It should have changed its p−>state before coming back.
            c−>proc = 0;
        }
        release(&ptable.lock);
    }
}
```

The `sched` function is as follows

```c
void
sched(void)
{
    int intena;
    struct proc *p = myproc();
    if(!holding(&ptable.lock))
    panic("sched ptable.lock");
    if(mycpu()−>ncli != 1)
    panic("sched locks");
    if(p−>state == RUNNING)
    panic("sched running");
    if(readeflags()&FL_IF)
    panic("sched interruptible");
    intena = mycpu()−>intena;
    swtch(&p−>context, mycpu()−>scheduler);
    mycpu()−>intena = intena;
}
```

The high level view is

![image-20210813235433748](assets/image-20210813235433748.png)

## When does a process call `sched`?

**Yield** - A timer interrupt occurs when a process has run for a long enough time.

**Exit** - The process has exit and set itself as zombie.

**Sleep** - A process has performed a blocking action and set itself to sleep.

##  `struct context`

This structure is saved and restored during a context switch. It is basically a set of registers to be saved when switching from one process to another. For example, we must save `eip` which signifies where the process has stopped. The context is pushed onto the kernel stack and the `struct proc` maintains a pointer to the context structure on the stack.

Now, the obvious question is "what is the difference between this and the [trap frame](#trap-frame-on-the-kernel-stack)?" We shall look into it now.

## Context structure vs. Trap frame

The trapframe (`p -> tf`) is saved when the CPU switches to the kernel mode. For example, `eip` in the trapframe is the `eip` value where the syscall was made in the user code. On the other hand, the context structure is saved when process switches to another process. For example, `eip` value when `swtch` is called. Both these structures reside on the kernel stack and `struct proc` has pointers to both of them. Although, they differ in the content they store. This sort of clears up the confusion in the [subtlety of memory storage](#a-subtlety-on-saving-context) in the kernel stack.

## `swtch` function

This function is invoked both by the CPU thread and the process. It takes two arguments, the **address of the pointer** of the old context and the pointer of the new context. We are not sending the address of the new context, but the context pointer itself.

```c
// When invoked from the scheduler: address of scheduler's context pointer, process context pointer
swtch(&(c -> scheduler), p -> context);
// When invoked from sched: address of process context pointer, scheduler context pointer
swtch(&p -> context, mycpu() -> scheduler);

```

 When a process/thread has invoked the `swtch`, the stack has caller save registers  and the return address (`eip`). `swtch` does the following -

- Push the remaining (callee save) registers on the old kernel stack.
- Save the pointer to this context into the context structure pointer of the old process.
- Switch `esp` from the old kernel stack to the new kernel stack.
- `esp` now points to the saved context of new process. This is the primary step of a context switch.
- Pop the callee-save registers from the new stack.
- Return from the function call by popping the return address after the callee save registers.

The assembly code of `swtch` is as follows -

```
# Context switch
void swtch(struct context **old, struct context *new);
Save the current registers on the stack, creating
a struct context, and save its address in *old.
Switch stacks to new and pop previously−saved registers.
.globl swtch
swtch:
movl 4(%esp), %eax
movl 8(%esp), %edx
# Save old callee−saved registers
pushl %ebp
pushl %ebx
pushl %esi
pushl %edi
# Switch stacks
# opposite order compared to MIPS
# movl src dst
movl %esp, (%eax)
movl %edx, %esp
# Load new callee−saved registers
popl %edi
popl %esi
popl %ebx
popl %ebp
ret
```

`eax` has the address of the pointer to the old context and `edx` has the pointer to the new context. 

> Why address of pointer?

## Summary of context switching in xv6

The old process, say P1, goes into the kernel mode and gives up the CPU. The new process, say P2, is ready to run. P1 switches to the CPU scheduler thread. The scheduler thread finds P2 and switches to it. Then, P2 returns from trap to user mode. The process of switching from one process/thread to another involves the following steps. All the register states (CPU context) on the kernel stack of the old process is saved. The context structure pointer of the old process is updated to this saved context. Then, `esp` moves from the old kernel stack to the new kernel stack. Finally, the register states are restored in the new kernel stack to resume the new process.