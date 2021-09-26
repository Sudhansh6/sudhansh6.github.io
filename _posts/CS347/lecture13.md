# Lecture 13 - Locks

We've concluded in the previous lecture that locks are the solution to the race conditions in threads. A lock variable helps in the exclusivity of the threads for protection.

```c
lock_t mutex;
lock(&mutex);
// Critical Section
unlock(&mutex);
```

All threads accessing a critical section share a lock. One of the threads locks the section - **owner of the lock**. Any other thread that tries to lock cannot proceed further until the owner releases the lock. Locks are provided by the `pthreads` library.

## Building a lock

Goals of a lock implementation

- Mutual exclusion
- Fairness - All threads should eventually get the lock, and no thread should starve
- Low overhead - Acquiring, releasing, and waiting for a lock should not consume too many resources.

Implementation of locks is needed for both user-space programs (e.g., `pthreads` library) and kernel code. Also, implementing locks needs support from hardware and the OS.

## Is disabling interrupts enough?

Previously, the race condition issue arose due to an interrupt at the wrong moment. So can we simply disable interrupts when a thread acquired a lock and is executing a critical section? No! The following issues will occur in that case - 

- Disabling interrupts is a privileged instruction, and the program can misuse it (e.g., run forever).
- It will not work on multiprocessor systems,since another thread on another core can enter the critical section.

Basically, we don't want to give a user program much power after acquiring a lock. However, this technique is used to implement locks on a single process system **inside the OS** (trusted code, e.g., xv6).

## Locks implementation (Failure)

Suppose we use a flag variable for a lock. Set the flag for acquiring the lock, and unset it for unlocking.

```c
typedef struct __lock_t {int flag; } lock_t;
void init(lock_t *mutex)
{
	mutex -> flag = 0;
}
void lock (lock_t *mutex)
{
    while (mutex -> flag == 1)
    	; // spin-wait (do nothing) 
	mutex -> flag = 1;
}
void unlock (lock_t *mutex)
{
    mutex -> flag  = 0;
}
```

What are the problems here? The race condition has moved to the lock acquisition code! How? Thread 1 spins, the lock is released, spin ends. Suppose thread 1 is interrupted just before setting the flag. Now, thread 2 sets the flag to 1. However, thread 1 still thinks lock is not acquired and sets the flag to 1. Therefore, both the threads have locks, and there is no mutual execution. 

Seeing the above implementation, it's clear that we cannot implement locks only using software. Hence, we need hardware atomic instructions.

## Hardware atomic instructions

Modern architectures provide hardware atomic instructions. For example, `test-and-set` - update a variable and return old value, all in one hardware instruction. We can design a simple lock using `test-and-set`.

```c
void lock (lock_t *mutex)
{
    while (TestAndSet(&lock -> flag, 1) == 1)
    	; // spin-wait (do nothing) 
}
```

If `TestAndSet(flag, 1)` returns 1, it means the lock is held by someone else, so wait busily. This lock is called a ***spinlock*** - spins until the lock is acquired.

There is also a `compare-and-swap` instruction which checks the expected value with the current value. If both the values are equal, the value is set to the new value. We can also implement a spinlock using this instruction.

```c
void lock(lock_t *lock) {
while(CompareAndSwap(&lock -> flag, 0, 1) == 1) ; //spin
}
```

## Alternative to spinning

We can make the thread sleep instead of spinning and utilizing the CPU. A contending thread could simply give up the CPU and check back later. In literature, a mutex by itself means a sleeping mutex.

```c
void lock(){
    while(TestAndSet(&flag, 1) == 1)
        yield(); // Name changes across OS
}
```

 ## Spinlock vs. mutex

Most user-space lock implementations are of sleeping mutex kind. However, the locks inside the OS are always spinlocks! Why? If we sleep in the OS code, we cannot context switch to another process. When OS acquires a spinlock - 

- It must disable interrupts (on that processor code) while the lock is held. Why? An interrupt handler could request the same lock and spin it forever - A deadlock situation.

  > What?

- It must not perform any blocking operation - never go to sleep with a locked spinlock!

In general, we must use spinlocks with care and release them as soon as possible.

## Usage of Locks

The user must acquire a lock before accessing any variable, or data structure shared between multiple threads of a process. This implementation is called a **thread-safe** data structure. All the shared kernel data structures must also be accessed only after locking. 

Coarse-grained vs. fine-grained locking - One big lock for all the shared data vs. separate locks for each variable. Fine-grained locking allows more parallelism but is harder to manage. The OS only provides locks, but the proper locking discipline is left to the user.