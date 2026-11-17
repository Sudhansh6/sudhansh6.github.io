# Lecture 6 - Inter-Process Communication (IPC)

In general, two processes do not share any memory with each other. Some processes might want to work together for a task, and they need to communicate information. The OS provides IPC mechanisms for this purpose.

## Types of IPC mechanisms

### Shared Memory

Two processes can get access to the same region of the memory via `shmget()` system call.

```c
int shmget(key_t key, int size, int shmflg)
```

By providing the same key, two processes can get the same segment of memory. 

> How do they know keys?

Although, when realizing this idea, we need to consider some problematic scenarios. For example, we need to take care that one process is not overwriting another's data.

### Signals

These are well-defined messages that can be sent to processes that are supported by the OS. Some signals have a fixed meaning. For example, a signal to terminate a process. Some signals can also be user-defined. A signal can be sent to a process by the OS or another process. For example, when you type `Ctrl + C`, the OS sends `SIGINT` signal to the running process.

These signals are handled by a **signal handler**. Every process has a  default code to execute for each signal. Some (Can't edit the terminate signal) of these signal handlers can be overridden to do other things. Although, you cannot send messages/bytes in this method.

### Sockets

Sockets can be used for two processes on the same machine or different machines to communicate. For example, TCP/UDP sockets across machines and Unix sockets in a local machine. Processes open sockets and connect them to each other. Messages written into one socket can be read from another. The OS transfers the data across socket buffers.

### Pipes

These are similar to sockets but are **half-duplex** - information can travel only in one direction. A pipe system call returns two file descriptors. These are simply **handles** that can read and write into files (read handle and write handle). The data written in one file descriptors can be read through another.

In regular pipes, both file descriptors are in the same process. How is this useful? When a parent forks a child process, the child process has access to the same pipe. Now, the parent can use one end of the pipe, and the child can use the other end. 

**Named pipes** can be used to provide two endpoints a pipe to different processes. The pipe data is buffered in OS (kernel) buffers between write and read.

### Message Queues

This is an abstraction of a mailbox. A process can open a mailbox at a specified location and send/receive messages from the mailbox. The OS buffers messages between send and receive.

## Blocking vs. non-blocking communication

Some IPC actions can block

- reading from a socket/pip that has no data, or reading from an empty message queue
- Writing to a full socket/pip/message queue

The system calls to read/write have versions that block or can return with an error code in case of a failure. 