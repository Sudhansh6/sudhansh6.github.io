# Live Session 7

- The OS does not raise a trap when you access a shared variable protected using a lock in another thread. Why? The usage of locks is wholly left to the user. The OS cannot see these variables too! A lock is nothing but another variable.

- Condition variable in a queue? That was a wrong statement in the slides. The implementation of the condition variables determines which thread is woken up first among the threads that are waiting. Even all of the threads can wake up at once. For example, in xv6, all the threads are woken up at once.

- Why `if` instead of a `while`? If all the waiting threads are woken up, then using `if` might cause a problem! `while` in case of *spurious* wake-ups.

- Why spinlocks in the OS code? The OS itself cannot yield itself to anybody else. It cannot rely on other processes to wake it up in case the lock is not acquired. The alternative to the spinlock implementation is using hardware help. The OS can wake up when the hardware gives an interrupt (after the lock is released). However, we don't have this support.

- Why does disabling interrupts on a single core work? This method is only for OS that works on a single thread. The OS can interrupt the user programs. However, only hardware can interrupt the OS. So, when you disable interrupts, there is no way the OS can be interrupted. 

  However, if you have a multicore architecture, another thread can access the shared variables from another core (not using locks here, just talking about disabling interrupts).

- The `sleep` function releases the lock. However, when the process wakes up, it reacquires the lock. So, there is no double-freeing. The doubt was asked based on [this](#condition-variables) context.

- Do we need to disable interrupts on all cores for smooth execution of OS code?  However, you need not disable interrupts on other cores. The OS code that needs to access this space has to acquire the lock (which is not possible as the original thread is the owner) and wait before accessing the shared space. 

  We said disabling interrupts won't work in multicore architecture (two points before). But that situation was not considering locks, and we have locks in this case.

  >  What happens if you disable interrupts on all cores anyway?

- > What do we do if a serious interrupt occurs when interrupts are disabled?

- Once a process commits to a core, it cannot run on another core in between. It has to finish on the current core itself.

- The concept of user threads and kernel threads. User-level threading libraries create an illusion of multiple threads. However, the kernel does not see these as independent processes but as a single process. For example, the `pthread` library is only for kernel threads. It is not an illusion. Nevertheless, even with a user-level thread, you can get interrupted at the wrong time. Therefore, we need locks even in the user-level illusionary threads.

- `int n` is an atomic instruction.