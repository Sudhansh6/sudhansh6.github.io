# Lecture 26 - User process creation

We know that the `init` process is created when xv6 boots up. The `init` process forks a shell process, and the shell is used to spawn any user process. The function `allocproc` is called during both `init` process creation and in fork system call.

## `allocproc`

It iterates over the `ptable`, finds an unused entry, and marks it as an embryo. This entry is later marked as runnable after the process creation completes. It also allocates a new PID for the process. Then, `allocproc` has to allocate space on the kernel stack. To do this, we start from the bottom of the stack and find some free space. We leave room for the trap frame. Then, we push the return address of `trapret` and also the context structure with `eip` pointing to the function `forkret`. When the new process is scheduled, it begins execution at `forkret`, returns to `trapret`, and finally returns from the trap to the user space. 

The role of `allocproc` is to create a template kernel stack, and make the process look like it had a trap and was context switched out in the past. This is done so that the scheduler can switch to this process like any other.

> Where is kernel mode? The sp points to the kernel stack.

```c
allocproc(void)
{
    struct proc *p;
    char *sp;
    acquire(&ptable.lock);
    for(p = ptable.proc; p < &ptable.proc[NPROC]; p++)
        if(p−>state == UNUSED)
            goto found;
    release(&ptable.lock);
    return 0;
    found:
        p−>state = EMBRYO;
        p−>pid = nextpid++;
        release(&ptable.lock);
        // Allocate kernel stack.
        if((p−>kstack = kalloc()) == 0){
            p−>state = UNUSED;
            return 0;
        }
        sp = p−>kstack + KSTACKSIZE;
        // Leave room for trap frame.
        sp −= sizeof *p−>tf;
        p−>tf = (struct trapframe*)sp;
        // Set up new context to start executing at forkret,
        // which returns to trapret.
        sp −= 4;
        *(uint*)sp = (uint)trapret;
        sp −= sizeof *p−>context;
        p−>context = (struct context*)sp;
        memset(p−>context, 0, sizeof *p−>context);
        p−>context−>eip = (uint)forkret;
        return p;
}
```



## `Init` process creation

The `userinit` function is called to create the `init` process. This is also done using the `allocproc` function. The trapframe of `init` is modified, and the process is set to be runnable. The `init` program opens `STDIN`, `STDOUT` and `STDERR` files. These are inherited by all subsequent processes as child inherits parent's files. It then forks a child, execs shell executable in the child, and waits for the child to die. It also reaps dead children.

## Forking a new process

Fork allocates a new process via `allocproc`. The parent memory image and the file descriptors are copied. Take a look at the [fork code](#fork-system-call) while you're reading this. The trapframe of the child is copied from that of the parent. This allows the child execution to resume from the next instruction after `fork()`. Only the return value in `eax` is changed so that the child returns its PID. The state of the new child is set to runnable, and the parent returns normally from the trap/system call.

## Summary of new process creation

New processes are created by marking a new entry in the `ptable` as runnable after configuring the kernel stack, memory image etc of the new  process. The kernel stack of the new process is made to look like that of a process that had been context switched out in the past.