# `Lecture` 30 - Sleep and Wakeup in xv6

Consider the following example. A process P1 in kernel mode gives up the CPU to block on an event. For e.g., reading data from disk. Then, P1 invokes `sleep` which calls `sched`. Another process P2 in kernel mode calls `wakeup` when an event occurs. This function marks P1 as runnable so that the scheduler loop switches to P1 in the future. For e.g., disk interrupt occurs while P2 is running. 

How does P2 know which process to wake up? When P1 sleeps, it sets a ***channel*** `(void* chan)` in its struct proc, and P2 calls `wakeup` on the same channel. This channel is any value known to both P1 and P2. Example: The channel value for a disk read can be address of a disk block. 

A spinlock protects the atomicity of sleep: P1 calls sleep with some spinlock L held, P2 calls wakeup with same spinlock L held. Why do we need this setup?

- Eliminating missed `wakeup` problem that arises due to P2 issuing wakeup between P1 deciding to sleep and actually sleeping.
- Lock L is released after sleeping, available for wakeup
- Similar concept to condition variables studied before.

The Sleep calls `sched` to give up the CPU with `ptable` lock held. The arguments to sleep are channel and a spinlock (not `ptable.lock`). `sleep` has to acquire `ptable.lock`, release the lock given to sleep (to make it available for wakeup). Unless lock given is `ptable.lock` itself, in which case no need to acquire the lock again. One of the two locks is always held!

When the control returns back to `sleep`, it reacquires the spinlock. 

> Why reacquire?

## Wakeup function

This is called by another process with lock held (same lock as when `sleep` was called). Since this function changes `ptable`, `ptable.lock` is also held. Now, this function wakes up all process sleeping on a channel in the `ptable`. It is also a good idea to check if the condition is still true upon waking up (use while loop while calling `sleep`). 

## Example: pipes

Two process are connected by a pipe (producer consumer). Addresses of pipe structure variables are channels (same channel known to both). There is a *pipe lock* given as input to `sleep`.

## Example: wait and exit

If `wait` is called in parent while children are still running, parent calls `sleep` and gives up the CPU. Here, channel is parent struct proc pointer, and lock is `ptable.lock`. In exit, the child acquires `ptable.lock` and wakes up the sleeping parent. Notice that here the lock give to `sleep` is ptable lock, because parent and child both access `ptable` (sleep avoids double locking, doesn't acquire `ptable.lock` if it already held before calling sleep).

Why is terminated process memory cleaned up by the parent? When a process calls exit, CPU is using its memory (kernel stack is in use, `cr3` is pointing to page table) so all this memory cannot be cleared until the terminated process has been taken off the CPU. Therefore, we need `wait`.