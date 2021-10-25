# Live Session 10

- What is a file system? All of the infrastructure related to files constitutes file system. What does it mean by OS can have more than one filesystems?

- It take a finite amount of time to fetch the data. When the DMA is not implemented, the CPU has to oversee the data transfer from the disk to the Memory. Yes, context switching and all happens when a data query is called. However, the interrupt handler is invoked only when the data is ready (in the disk registers) in the disk itself (It takes time to get the data ready too!). Once an interrupt is issued, the CPU copies data from the disk registers to multiple layers of caches and the main memory.

  DMA only accesses kernel buffers.

- Advantage of memory mapped files? When you have to read a large chunk, you don't have to wait for the disk to send multiple blocks. The file is already available in the memory. The main advantage of memory-mapped files is avoiding the extra copy of the data in the memory! Any disk access is first copied into the disk buffer cache. These data blocks are then added to the process' virtual address space. However, the data blocks are only present in the virtual address space when you use memory-mapped files.

- Normal read/write - Get a block from the disk into the kernel data cache, copy the bytes into the user space buffer. In memory mapping, the user space buffer does not have a copy but a pointer to the kernel buffer directly. There exists a concept of block/page cache which is an advanced concept. 

- Mounting - Joining two trees by creating a new node that is the root of another directory tree.

- We have different entries in file table when two processes open the same file to ensure concurrency and **correctness**. Two files can read/write simultaneously if there are two entries. However, a parent and the child will point to the same file entry! This is why STD ERR/IN/OUT are the same for all processes.

- What is the use of the global file table? For the OS to keep track of all the open files in a central repository.

- Why not store the offset in the process' file descriptor array itself? We need to have some processes sharing the offsets and some to not share them. The implementation is difficult, but it can be done.

- The indirect blocks are not counted as the data blocks of the process!