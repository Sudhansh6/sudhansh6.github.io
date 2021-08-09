# Lecture 23 - System calls for process management in xv6

## Process system calls: Shell

When xv6 boots up, it starts the init process (the first user process). Init forks shell, which prompts for input. This shell process is the main screen that we see when we run xv6.

Whenever we run a command in the shell, the shell creates a new child process, executes it, waits for the child to terminate, and repeats the whole process again. Some commands have to be executed by the parent process itself and **not by the child**. For example, `cd` command should change the parent's (shell) current directory, not of the child. Such commands are directly executed by the shell itself without forking a new process.

## What happens on a system call?

All the system calls available to the users are defined in the user library header **'user.h'**. This is equivalent to a C library header (xv6 doesn't use a standard C library). System call implementation invokes a special **trap** instruction called **`int`** in x86. All the system calls are defined in "usys.S".

The trap (int) instruction causes a jump to kernel code that handles the system call. Every system call is associated with a number which is moved into `eax` to let the kernel run the applicable code. We'll learn more about this later, so don't worry about this now.

## Fork system call

Parent allocates new process in `ptable`, copies parent state to the child. The child process set is set to runnable, and the scheduler runs it at a later time. Here is the implementation of `fork()`

```c
int
fork(void)
{
    int i, pid;
    struct proc *np;
    struct proc *curproc = myproc();
    // Allocate process.
    if((np = allocproc()) == 0){
        return −1;
    }
    // Copy process state from proc.
    if((np−>pgdir = copyuvm(curproc−>pgdir, curproc−>sz)) == 0){
        kfree(np−>kstack);
        np−>kstack = 0;
        np−>state = UNUSED;
        return −1;
    }
    np−>sz = curproc−>sz;
    np−>parent = curproc;
    *np−>tf = *curproc−>tf;
    // Clear %eax so that fork returns 0 in the child.
    np−>tf−>eax = 0;
    for(i = 0; i < NOFILE; i++)
        if(curproc−>ofile[i])
            np−>ofile[i] = filedup(curproc−>ofile[i]);
    np−>cwd = idup(curproc−>cwd);
    safestrcpy(np−>name, curproc−>name, sizeof(curproc−>name));
    // Set new pid
    pid = np−>pid;
    acquire(&ptable.lock);
    // Set Process state to runnable
    np−>state = RUNNABLE;
    release(&ptable.lock);
    // Fork system call returns with child pid in parent
    return pid;
}
```

## Exec system call

The source code is a little bit complicated. The key steps include

- Copy new executable into memory, replacing the existing memory image
- Create new stack, heap
- Switch process page table to use the new memory image
- Process begins to run new code after system call ends

## Exit system call

Exiting a process cleans up the state and passes abandoned children to `init`. It marks the current process as a zombie and invokes the scheduler.

```c
void
exit(void)
{
    struct proc *curproc = myproc();
    struct proc *p;
    int fd;
    if(curproc == initproc)
        panic("init exiting");
    // Close all open files.
    for(fd = 0; fd < NOFILE; fd++){
        if(curproc−>ofile[fd]){
            fileclose(curproc−>ofile[fd]);
            curproc−>ofile[fd] = 0;
        }
    }
    begin_op();
    iput(curproc−>cwd);
    end_op();
    curproc−>cwd = 0;
    acquire(&ptable.lock);
    // Parent might be sleeping in wait().
    wakeup1(curproc−>parent);
    // Pass abandoned children to init.
    for(p = ptable.proc; p < &ptable.proc[NPROC]; p++){
        if(p−>parent == curproc){
            p−>parent = initproc;
            if(p−>state == ZOMBIE)
                wakeup1(initproc);
        }
    }
    // Jump into the scheduler, never to return.
    curproc−>state = ZOMBIE;
    // Invoke the scheduler
    sched();
    panic("zombie exit");
}
```

Remember, the complete cleanup happens only when a parent reaps the child.

## Wait system call

It must be called to clean up the child processes. It searches for dead children in the process table. If found, it cleans up the memory and returns the PID of the dead child. Otherwise, it sleeps until one dies.

```c
int
wait(void)
{
    struct proc *p;
    int havekids, pid;
    struct proc *curproc = myproc();
    acquire(&ptable.lock);
    for(;;){
        // Scan through table looking for exited children.
        havekids = 0;
        for(p = ptable.proc; p < &ptable.proc[NPROC]; p++){
            if(p−>parent != curproc)
                continue;
            havekids = 1;
            if(p−>state == ZOMBIE){
                // Found one.
                pid = p−>pid;
                kfree(p−>kstack);
                p−>kstack = 0;
                freevm(p−>pgdir);
                p−>pid = 0;
                p−>parent = 0;
                p−>name[0] = 0;
                p−>killed = 0;
                p−>state = UNUSED;
                release(&ptable.lock);
                return pid;
            }
        }
        // No point waiting if we don’t have any children.
        if(!havekids || curproc−>killed){
            release(&ptable.lock);
        return −1;
    }
    // Wait for children to exit. (See wakeup1 call in proc_exit.)
    sleep(curproc, &ptable.lock);
    }
}
```

## Summary of process management system calls in xv6

- Fork - process marks new child's `struct proc` as `RUNNABLE`, initializes child memory image and other states that are needed to run when scheduled
- Exec - process reinitializes memory image of user, data, stack, heap, and returns to run new code.
- Exit - process marks itself as `ZOMBIE`, cleans up some of its state, and invokes the scheduler
- Wait - parent finds any `ZOMBIE` child and cleans up all its state. IF no dead child is found, it sleeps (marks itself as `SLEEPING` and invokes scheduler).

> When do we call wait in the parent process?