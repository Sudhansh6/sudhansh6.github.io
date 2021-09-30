## Lecture 16 - Concurrency Bugs

In general, writing multi-threaded programs is tricky. These bugs are non-deterministic and occur based on the execution order of threads - challenging to debug. We shall discuss two types of bugs in this lecture and methods to prevent them.

- Deadlocks - Threads cannot execute any further and wait for each other. These are very dangerous.
- Non-deadlock bugs - Non-deadlock, but the results are incorrect when the threads execute.

## Non-deadlock bugs

These are of two types -

- **Atomicity bugs** - Occur due to false atomicity assumptions that are violated during the execution of concurrent threads. We fix these bugs using locks!

  Example - 

  ```c
  Thread 1::
  if (thd -> proc_info)
  {
  	fputs(thd -> proc_infor, ...);
  }
  Thread 2::
  thd -> proc_info = NULL;
  ```

  This situation is basically a race condition! Although, the crucial point to note here is atomicity bugs can occur, not just when writing to shared data, but even when reading it!

  Always use a **lock** when **accessing shared data**.

- **Order-violation bugs** - Occur when desired order of memory accesses is flipped during concurrent execution. We fix these using condition variables.

  ```c
  Thread 1::
  void init()
  {
  	mThread = PR_CreateThread(mMain, ...);
  }
  Thread 2::
  void mMain(...)
  {
  mState = mThread -> State;
  }
  ```

  Thread 1 assumes  that Thread 2 had been executed before, and this causes an error.

## Deadlock bugs

Here is a classic example of a deadlock situation.

```c
// Thread 1:
pthread_mutex_lock(L1);
pthread_mutex_lock(L2);
// Thread 2:
pthread_mutex_lock(L2);
pthread_mutex_lock(L1);
```

Deadlock may not always occur in this situation. It only occurs when the executions overlap, and a context switch occurs from a thread after acquiring only one lock. It is easy to visualize these situations using a dependency graph. A cycle in a dependency graph causes a deadlock situation.

When does a deadlock occur?

1. Mutual exclusion - A thread claims exclusive control of a resource (e.g., lock)
2. Hold-and-wait - The thread holds a resource and is waiting for another
3. No preemption - A thread cannot be made to give up its resource (e.g., cannot take back a lock)
4. Circular wait - There exists a cycle in the resource dependency graph.

All of the above conditions must hold for a deadlock to occur.

> Isn't (4) by itself enough for a deadlock? *the cycle must be reachable*

To prevent a circular wait, we need to acquire locks in a particular fixed order! e.g., both threads acquire L1 before L2 in the previous example.

To do this, we need a total (partial) ordering of locks. For example, this ordering can be done via the address of lock variables.

### Preventing hold-and-wait

Acquire all locks at once using a *master* lock.  This way, you will hold all locks or none of them. However, this method may reduce concurrent execution and performance gains. *Think*.

### Other solutions to deadlocks

**Deadlock avoidance** - If the OS knows which process needs which locks, it can schedule the processes in that deadlock will not occur. One such algorithm is ***Banker's algorithm***. But it is impractical in real life to assume this knowledge. 

**Detect and recover** - Reboot system or kill deadlocked processes. There is no standard implementation to tackle deadlocks. :(