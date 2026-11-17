# Lecture 31 - Device driver and block I/O in xv6

Any filesystem is built as multiple layers of abstraction in file systems -

- System call implementations - open, read, write.
- Operations on file system data structures - inodes, files, directories.
- Block I/O layer - in-memory cache of disk blocks.
- Device driver - communicates with hard disk to read/write blocks.

## Disk blocks and buffers

Disk maintains data as 512-byte blocks. Any disk block handled by the OS is also backed up in the disk buffer (`struct buf` in kernel memory). This is basically a copy of disk block in the memory. All the `struct buf`s are stored in a fixed size Buffer cache called as `bcache`. This is maintained as a LRU linked list. 

When we read from the disk, we assign buffer for the block number in the buffer cache, and the device driver sends read request to the disk controller. The disk controller raises an interrupt when the data is ready, and then the data is copied from the disk controller to the buffer cache - `VALID` flag is set after data is read.

When we write to the disk, we first write into the buffer cache, and then issue a request to the disk. The device driver copies data from the buffer to the disk controller, and the disk controller raises an interrupt when write is complete - `DIRTY` flag is set until disk is updated.

## Device Driver

Processes that wish to read/write call the `iderw` function with buffer as the argument. If the buffer is dirty, it initiates a write request. If a buffer is invalid, then it places a read request. Requests are added to the queue and the function `idestart` issues requests after one another. The process sleeps until the request completes. The communication with the disk controller registers is done in `idestart` via `in`/`out` instructions we've seen before. This function knows all the register addresses of the devices - code is customized for every device.

When the disk controller completes read/write operation, it raises an interrupt

- Data is read from the disk controller intos the buffer using `in` instruction
- The sleeping processes are woken up
- The next request from the queue is issued

All of this is done in `ideintr` function which is called via the `trap` function. Also, there is no support for DMA in x86. With a DMA, the data is copied by the disk controller into the memory buffers directly before raising an interrupt. However, the CPU has to oversee this in xv6 without the presence of the DMA.

> so the `insl` instruction is run by the DMA in DMA-supported cores?

## Disk buffer cache

All processes access the disk via the buffer cache. There exists only one copy of the disk block in cache, and only one process can access it at a time. 

The process calls `bread` to read a disk block. This function in turn calls `bget` which returns buffer if it already exists in the cache and no other process using it (using locks). Otherwise, if valid buffer is not returned by `bget`, `bread` reads from the disk using `iderw`.

A process calls `bwrite` to write a block to disk, set dirty bit and request device driver to write. When done with the block, the process calls `brelse` to release the block and moves it to the head of the list. 

Let's delve into `bget`. It returns the pointer to the disk block if it exists in the cache. If the block is in cache and another process is using it, it sleeps until the block is released by the other process. However, if block is not in cache, it fins a least recently used non-dirty buffer and recycles it to use for this block. 

> What if all blocks are dirty? `panic!`

The two goals achieved by the buffer cache are

- Recently used disk blocks are stored in the memory for future use.
- Disk block are modified by only one process at a time.

## Logging layer

A system call can change multiple blocks at a time on the disk, and we want atomicity in case the system crashes during a system call. So, wither all changes are made or none is made. **Logging** ensures atomicity by grouping disk block changes into transactions

- Every system call starts a transaction in the log, write all changed disk blocks in the log, and commits the transaction.
- Later, the log installs the changes in the original disk blocks one by one.
- If a crash happens before the log is written fully, no changes are made. However, if a crash happens after the log entry is committed, the log entries are replayed when the system restarts after crash.

> restart from the start or last left entry?

In xv6, changes of multiple system calls are collected in memory and committed to the log together. Actual changes happen to disk blocks only after the group transaction commits. The process must call `log_write` instead of `bwrite` during the system call. (?)

