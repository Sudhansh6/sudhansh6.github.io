# Live Session 3

- What is a scheduler thread? It is a kernel process that is a part of the OS. It always runs in kernel mode, and it is not a user -level process.

- `int n` is a hardware instruction and is enabled by a *hardware descriptor language*. It is similar to, say,  the `add` instruction. Why is it a hardware instruction? We don't trust the software. As it is a hardware instruction, we can trust the CPU maker to bake the chip correctly.

- The `trapframe` has the user context, and the context structure has the kernel context. Every context switch is preceded by a trap instruction. A context switch only happens in the kernel mode. Now, what if a user process does not go to the kernel mode ever? The timer interrupt will take care of this. It will prompt the process to go into trap mode if the process has run for too long.

- In the [subtlety on saving context](#a-subtlety-on-saving-context), the first point refers to storing the trapframe. The second point refers to storing the context structure.

- `forkret` is a small function that a program has to execute after a process has been created. This mainly involves the locking mechanism that will be discussed later. `fork` is a wrapper of `allocproc`

- `sched` is only called by the user processes in case of `sleep`, `exit`, and `yield`. `sched` stores the context of the current context onto the kernel stack. The `scheduler` function is called by the scheduler thread to switch to a new process. Both of these functions call the `swtch` function to switch the current process. Think of the CPU scheduler (scheduler thread) as an intermediate process that has to be executed when switching from process A to process B. 

  Why do we need this intermediate process? Several operating systems make do without a scheduler thread. This is modular, and xv6 chose this methodology. The `scheduler` function simply uses the Round Robin algorithm.