# Live Session 4

- The scheduler/PC does not always know the running time of the processes. Therefore, we can't implement SJF and SRTF in practice.
- The shared key is shared offline (say, via a command-line argument) in the shared memory IPC.
- Every process has a set of virtual addresses that it can use. `mmap()` is used to fetch the free virtual addresses. It is mainly used for allocating *large* chunks of memory (allocates pages). It can be used to get *general memory* and not specifically for heap. On the other hand, `brk` and `sbrk` grow the heap in *small* chunks. `malloc` uses these two system calls for expanding memory.
- Conceptually, sockets and message queues are the same. The two structures just have a different programming interface.
- `libc` and `malloc` can't be used in the kernel because these are user-space libraries. The kernel has its own versions of these functions. Variants. 
- The C library grows the heap. The OS grows the stack. This is because the heap memory is an abstraction provided by the C libraries. The C library gets a page of memory using `mmap()` and provides a small chunk of this page to the user when `malloc()` is called. Suppose the stack runs out of the allocated memory. In that case, the OS either allocates new memory and transfers all the content if required or terminates the process for using a lot of memory.