# Lecture 29 - Locking in xv6

Why do we need locking in xv6? There are no threads in xv6! Therefore, no two user programs can access the same userspace memory image. However, there is a scope for concurrency in xv6 kernel. For example, two processes in the kernel mode on different CPU cores can access the same data structures. Another example where this sort of thing happens is in the case of interrupts. When an interrupt occurs while processing the trap of another process, the new interrupt handler can access the previous kernel code. Therefore, we need `spinlocks` to protect critical sections in xv6. xv6 also has a sleeping lock which is built on spinlock.

## Spinlocks in xv6

```c
 // Mutual exclusion lock.
struct spinlock {
uint locked; // Is the lock held?

// For debugging:
char *name; // Name of lock.
struct cpu *cpu; // The cpu holding the lock.
uint pcs[10]; // The call stack (an array of program counters)
// that locked the lock.
};
/////////////////////////////////
void
acquire(struct spinlock *lk)
{
pushcli(); // disable interrupts to avoid deadlock.
if(holding(lk))
panic("acquire");

// The xchg is atomic.
while(xchg(&lk−>locked, 1) != 0)
;

// Tell the C compiler and the processor to not move loads or stores
// past this point, to ensure that the critical section’s memory
// references happen after the lock is acquired.
__sync_synchronize();

// Record info about lock acquisition for debugging.
lk−>cpu = mycpu();
getcallerpcs(&lk, lk−>pcs);
}
```

Locks are acquired using `xchg` x86 atomic instruction. It is similar to `test-and-set` we've seen before. The `xchg` instruction sets the lock variable to 1 and returns the previous value. Remember, value of 1 means locked! Also, note that we need to disable interrupts on the CPU core before spinning for lock. It is okay for another process to spin for this lock on another core. This is because, the lock will be eventually released by this core (no deadlock can occur).

## Disabling interrupts

Interrupts are disabled using `pushcli`. The interrupts must stay disabled until **all** locks are released. `pushcli` disables interrupts on the first lock acquire, and increments count for future locks. Then, `popcli` decrements count and reenables interrupts only when count is zero.

## ptable.lock()

The process table is protected by this lock. Normally, a process in kernel mode acquires `ptable.lock`, changes `ptable`, and then release the lock. However, during a context switch, from process P1 and P2, the `ptable` structure is changed continuously and repeatedly. So when do we release the lock? P1 acquires the lock, switches to scheduler, switches to P2, and then finally P2 releases the lock. This is a special case where one process acquires the lock and another releases it.

Every function that calls `sched` will do so with `ptable.lock` held. `sched` is called from `yield`, `sleep`, and `exit`. Every function that `swtch` switches to will release `ptable.lock`. `swtch` also returns to 

- Yield, when switching from process that is resuming after yielding is done
- Sleep, when switching in a process that is waking up after sleep
- Forkret for newly created processes

Thus, the process of `forkret` is to release `ptable.lock` after context switch, before returning to `trapret`.

What about the scheduler? We enter the scheduler with the lock held! Sometimes, the scheduler releases the lock  (after it loops over all processes), and then reacquires it. Why does it do this? Whenever the lock is held, all interrupts are disabled. All processes might be in a blocked state waiting for interrupts. Therefore, the lock must be released periodically enabling interrupts and allowing process to become runnable.

