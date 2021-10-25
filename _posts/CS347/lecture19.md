# Lecture 19 - File System Implementation

A ***file system*** is a way of organization of files and directories on a disk. An OS has one or more file systems. There are two main aspects of a file system - 

- Data structures to organize data and metadata on the disk.
- Implementation of system calls like open, read, write, etc. using the data structures.

Usually, disks expose a set of blocks - of size 512 bytes in general. The file system organizes files onto blocks, and system calls are translated into reads and write on blocks.

## A simple file system

The blocks are organized as follows - 

- Data blocks - File data stored in one or more blocks.
- Metadata such as location of data blocks of a file, permissions, etc. about every file stored in the inode blocks. Each block has one or more inodes.
- **Bitmaps** - Indicate which inodes/data blocks are free.
- **Superblock** - Holds a master plan of all other blocks (which are inodes, which are data blocks, etc.)

### inode table

Usually, inodes (index nodes) are stored in an array. Inode number of a file is index into this array. What does an inode store?

- File metadata - Permissions, access time, etc.
- Pointers (disk block numbers) of the file data.

### inode structure

The file data need not be stored contiguously on the disk. It needs to be able to track multiple block number of a file. How does an inode track disk block numbers? 

- Direct pointers - Numbers of first few blocks are sored in the inode itself (suffices for small files)
- Indirect blocks - For larger file, inode stores number of indirect block, which has block numbers of file data.
- Similarly, double and triple indirect blocks can be stores - **multi-level** index

### File Allocation Table (FAT)

Alternate way to track file blocks. FAT stores next block pointer for each block. FAT has one entry per disk block, and the blocks are stored as a linked list. The pointer to the first block is stored in the inode.

### Directory Structure

A directory stores records mapping filename to inode number. Linked list of records, or more complex structures (hash tables, binary search trees, etc.). A directory is a special type of file and has inode and data blocks (which store the file records).

### Free space management

How to track free blocks? Bitmaps, for inodes and data blocks, store on bit per block to indicate if free or not. Also, we can have a **free list** in which the super block stores a pointer to the first free block and the free blocks are stored as a linked list. We can also use a more complex structure.

### Opening a file

The file has to be opened to have the inode readily available (in memory) for future operations on the file. What happens during open?

- The pathname of the file is traversed, starting at root.
- inode of root is known, to bootstrap the traversal.
- Then, we recursively fetch the inode of the parent directory, read its data blocks, get inode number of the relevant child, and fetch inode of a child.

- If a new file, new inode and data blocks will have to be allocated using bitmap, and the directory entry is updated.

### Open file table

There is a global open file table which stores on entry for every file opened (even sockets, pipes). The entry point to in-memory copy of the inode (other data structures for sockets and pipes). 

There also exists a per-process open file table which is an array of files opened by a process. The file descriptor number is an index into this array. The per-process table entry points to the global open file table entry. Every process has three file - standard in/out/err open by default (fd 0, 1, 2).

Open system call creates entries in both tables and return the fd number.

### Reading and writing a file

For reading/writing a file

- Access in-memory inode via the file descriptor.
- Find the location of data block at current read/write offset. We get the locations from the inode itself.
- Fetch block from disk and perform operation. 
- Write may need to allocate new blocks from disk using bitmap of free blocks.
- Update time of access and other metadata in inode.

Therefore, any access to a file accesses multiple data blocks - hence, we need multiple accesses to the disk.

### Virtual File System

File systems differ in implementations of data structures - E.g., organization of file records in the directory. So, do the implementations of the system calls need to change across file systems? No! Linux supports virtual file system (**VFS**) abstraction. The VFS looks at a file system as objects (files, directories, inodes, superblock) and operations on these objects. The system call logic is written on these VFS objects.

Therefore, in order to develop a new file system, simply implement functions on VFS objects and provide pointers to these functions to the kernel. Syscall implementations need not change with the file system implementation details.

## Disk Buffer cache

Results of recently fetched disk blocks are cached. The file system issues block read/write requests to block numbers via a buffer cache. If the block is in the cache, served from the cache and disk I/O is not required. Otherwise, block fetched to cache and returned to the file system.

> What about inode updates?

Write are applied to cache block first. Synchronous/write-through cache write to disk immediately. Asynchronous/write-back caches stores dirty blocks in memory and writes back after a delay.

Usually, the page cache is unified in the OS. Free pages are allocated to both processes and disk buffer cache from a common pool. What are the benefits of caches?

- Improved performance due to reduced disk I/O.
- Single copy of block in memory - No inconsistency across processes 

> Second point? It's fine.

Some applications like databases may avoid caching altogether, to avoid inconsistencies due to crashes - **direct I/O**.