# Lecture 12 - Threads and Concurrency

So far, we have studied **single-threaded** programs. That is, there is only a single thread of execution. When a given memory image is being executed in the memory, there is only a single *execution flow*. A program can also have multiple threads of execution.

Firstly, what is a **thread**? A thread is like another copy of a process that executes independently. In a multi-threaded program, we have multiple threads of execution. For example, a 2-thread process will have 2 PCs and 2 SPs. Threads share the same address space. However, each thread has a separate PC to run over different parts of the program simultaneously. Each thread also has a separate stack for independent function calls.

## Process vs. Thread

When a parent process P forks a child C, P and C do not share any memory. They need complicated [IPC mechanisms](#lecture-6---inter-process-communication-ipc). If we want to transfer data while running different parts of the process simultaneously, we need extra copies of code and data in memory. It's very complicated to handle simultaneous execution using processes.

However, if a parent P executes two threads T1 and T2, they share parts of the address space. The process can use global variables for communication. This method also has a smaller memory footprint.

In conclusion, threads are like separate processes, except they use the same address space.

## Why threads?

Why do we want to run different parts of the same program simultaneously? **Parallelism** - A single process can effectively utilize multiple CPU cores. There is a difference between **concurrency** and **parallelism**.

- Concurrency - Running multiple threads/ processes in tandem, even on a single CPU core, by interleaving their executions. Basically, all the stuff we've learned in the single thread execution.
- Parallelism - Running multiple threads/processes in parallel over different CPU cores.

We can exploit parallelism using multiple threads. Even if there is no scope for parallelism, concurrently running threads ensures effective use of CPU when one of the thread blocks.

## Scheduling threads

The OS schedules threads that are ready to run independently, much like processes. The context of a thread (PC, registers) is saved into/ restored from a ***thread control block (TCB)***. Every PCB has one or more linked TCBs. Threads that are scheduled independently by the kernel are called **kernel threads**. For example, Linux `pthreads` are kernel threads.

> What are kernel threads?

In contrast, some libraries provide user-level threads. These are not very common. This fact implies that not all threads are kernel threads. The library multiplexes a larger number of user threads over a smaller number of kernel threads. The kernel of the process sees these threads as separate processes. Also, note switching between user threads has a low overhead (nothing like context switching). However, multiple user threads cannot be run in parallel. Therefore, user threads are not very useful.

> What is going on in the above paragraph?

## Creating threads using `pthreads` API

Here is a simple thread creating code.

```c
# include <pthread.h>
int main(...)
{
	pthread_t p1, p2;
	int rc = pthread_create(&p1, NULL, fun1, "function_argument"); 
	assert(rc == 0);
	rc = pthread_create(&p2, NULL, fun2, "arg2");
	assert(rc == 0);
	// Join wait for the threads to finish
	rc = pthread_join(p1, NULL); asssert(rc == 0);
	rc = pthread_join(p2, NULL); asssert(rc == 0);
}
```

We usually want to run different threads for them to perform a job together. We do this using *global variables*. For example, suppose a function increments a global counter to 10. Suppose we run two threads for this function. The final counter value after the execution of both threads should be 20. Sometimes, it may be a lower value too! Why? An issue with threads.

When multiple threads access the same space of data, all weird things happen. For example, a wrong value is propagated across threads when the OS/CPU switches from one thread to another before the thread could save the new value in the global variable. The problem is depicted in the following example.

 ## Race conditions and synchronization

What just happened is called a race condition where concurrent execution led to different results. The portion of code that can lead to race conditions is known as the ***critical section***. We need **mutual exclusion**, where only one thread should be executing the critical section at any given time. For this to happen, the critical section should execute like one uninterruptable instruction - ***atomicity*** of the critical section. How is this achieved? ***Locks***.