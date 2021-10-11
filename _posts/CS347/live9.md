# Live Session 9

- What if 2 threads on *different* CPU cores perform `test-and-set`? This is ensured on the micro-architectural level. These are called **cache coherence protocols**. Memory can only be modified by a single core at a given time. Two or more cores cannot edit a variable simultaneously. Therefore, atomicity at the CPU level is guaranteed.
- Why don't we use sleep locks everywhere? The context switch overhead might be more than the wait time in sleeping locks. Suppose we have a single core, and a process on this core is spinning for a lock. Since there are no other cores, the lock owner cannot release lock at this instant. What happens here? The process will keep spinning until it eventually has to yield the CPU.
- In semaphores, every `up` should wake up one thread! `down` checks if the counter is negative and goes to sleep. When `up` signals these sleeping threads, they wake up even though the counter is negative.
- Interrupts are queued up when interrupts arrive on an interrupt-disabled core.
- `myproc()`? In xv6, we have an assumption that no processes on any other core edit the `struct proc` of the running process. Therefore, we don't need any locks to access the `struct proc` of the running process.
- The reacquiring of the second lock in `sleep` is not necessary but is a convention. Why do we send this lock to `sleep`? To preserve the atomicity of `sleep`!
- How does an interrupt know the channel to wakeup a process? Every interrupt handler has a logic for deciphering the channel. For ex, a disk read interrupt handler knows that the sector of the address read is the channel.
- Missed wakeups cause deadlocks!

