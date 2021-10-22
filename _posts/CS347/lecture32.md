# Lecture 32 - File system implementation in xv6

## Disk layout

The disk in xv6 is formatted to contain a superblock (followed by the boot block), log (for crash recovery), inode blocks (multiple inodes packed per block), bitmap (indicating which data blocks are free), and, finally, the actual data blocks.

The disk inode contains block number of direct blocks and **one** indirect block. Also, directory is treated as a special file. The data blocks contain directory entries and the corresponding name-inode number mappings. The inode also stores the link count - number of directory entries pointing to a file inode.

## In-memory data structures

Every open file has a struct file associated with it which contains some variables such as pointer to inode and pipe structure. All struct files are stored in a fixed size array called the file table ([`ftable`](https://www.cse.iitd.ac.in/~sbansal/os/previous_years/2011/xv6_html/file_8c.html#5e3713b2e8d8fca04c15e52b9a315620)). The *file descriptor array of a process* contains pointers to struct files in the file table. 

What happens if two different processes open the same file? They have two different entries in file table because they need to read and write independently at different offsets. However, the file table entries point to the same inode.

On the other hand, when P forks C, both file descriptors will point to the same struct file (`ref` is increased) and the offsets are shared. The reference count of struct file is number of file descriptors that point to it. Similarly, an inode also has such a reference number.

The in-memory [inode](https://www.cse.iitd.ac.in/~sbansal/os/previous_years/2011/xv6_html/fs_8c.html#6baaf26dd83b71b8d684c5d54a709e31) is almost a copy of the disk inode, stored in the memory for open files. All of these in-memory inodes are stored in a fixed size array called **inode cache** [`icache`](https://www.cse.iitd.ac.in/~sbansal/os/previous_years/2011/xv6_html/fs_8c.html#1fbfdebf96af7ed1f992e387cba059b3). The in-memory has a `ref` that the disk inode doesn't have. It stores the number of pointers from the file table entries. This is different from the `nlink` which counts the number of files that point to this inode in the disk. A file is cleaned up on the disk only when both `ref` and `nlink` are zero.

>  Cleaned up from memory or disk?

## inode functions

- Function `ialloc` allocates a free inode from the disk by looking over disk inodes and finding a free on for a file. 
- Function `iget` returns a reference counted pointer to in-memory inode in `icache` to use in struct file etc. This is a non-exclusive pointer which means the information inside inode structure may not be up to date. 
- Function `iput` does the opposite of the above function.
- Function `ilock` locks the inode for use by a process, and updates it information from the disk if needed. `iunlock` is the opposite.
- Function `iupdate` propagates changes from in-memory inode to on-disk inode.

> `ilock` updates from disk? Also, why not up to date info? All share pointers right?

Inode also has pointers to file data blocks. The function [`bmap`](https://www.cse.iitd.ac.in/~sbansal/os/previous_years/2011/xv6_html/fs_8c.html#965e83e1fa9b15abf268784ce74181bb) returns the address of the nth block of the file. If it's a direct block, we read from the inode. Otherwise, we read indirect block first and then return block number from it. This function can allocate data blocks too - if n-th data block of the file is not present, it allocates a new block on the disk, writes it to the inode and returns the address. Function `readi`/`writei` are used to read/write file data at a given offset. They call `bmap` to find the corresponding data block. Additionally, `bmap` uses `balloc` to allocate a data block in the disk, and `bread` to read the data blocks.

## Directory functions

We have two additional functions for directories:

- Directory lookup - Read directory entries from the data blocks of the directory. If file name matches, return pointer to the inode from `icache`. - [`dirlookup`](https://www.cse.iitd.ac.in/~sbansal/os/previous_years/2011/xv6_html/fs_8c.html#a182c62fade7a0bae9408830d5e06d4f)
- Linking a file to a directory - Check file with the same name does not exist, and add the mapping from file name to inode number to the directory.  - [`dirlink`](https://www.cse.iitd.ac.in/~sbansal/os/previous_years/2011/xv6_html/fs_8c.html#69a135a0e8a06d9f306d77ebc0c1f7a0)

## Creating a file

We locate the inode of the parent directory by walking the filepath from the root. Then, we look up the filename in the parent directory. We return the inode if the file already exists. Otherwise, we allocate a new inode for it, lock it, and initialize it. If the new file is a directory, we add entries for `.` and `..`. Otherwise, we link it to its parent directory. All of this is done in the [create](https://www.cse.iitd.ac.in/~sbansal/os/previous_years/2011/xv6_html/sysfile_8c.html#8700568adc174a9e10c167daf6296c8d) function.

> Is create a system call?

## System call - `open`

We get the arguments - filename and the mode. We create a file (if specified) and get a pointer to its inode. Then, we allocate a new struct file in the `ftable`, and also a new file descriptor entry in struct proc of the process pointing to the struct file in `ftable`. Finally, we return the index of new entry in the file descriptor array of the process. *Note* - `begin_op` and `end_op` capture the transactions for the log file.

## System call - `link`

This function links an existing file from another directory with a new name (hard linking).

> Is different directory necessary?

We get the pointer to the file inode by walking the old file name. Then, we update the link count in the inode. Once we get the pointer to the inode in the new directory, we link the old inode from the parent directory using a new name.

> Do we need a new filename? Do we need a different directory?

## System call - `fileread`

The `sys_read` system call calls `fileread`. This is a general template for the other system calls. For example, file read does the following -

- Get arguments (file descriptor number, buffer to read into, number of bytes to read)
- Fetch inode pointer from the struct file and perform read on inode (or pipe if the file descriptor pointed to pipe). 

> What pipe?

- Function `readi` uses the function `bmap` to get the block corresponding to the nth byte and reads from it.
- Offset in struct file is updated.

## Summary

- Disk is organized as inodes, data blocks and bitmaps
- The in-memory organization consists of file descriptor array which points to struct file in file table array which in turn points to in-memory inode in the inode cache. 
- A directory is a special file where data blocks contain directory entries (filenames and corresponding inode numbers).
- Updates to disk happen via the buffer cache***. Changes to all blocks in a system call are wrapped in a transaction and are logged for atomicity.

### References

- [doxygen documentation of xv6 user code](https://www.cse.iitd.ac.in/~sbansal/os/previous_years/2011/xv6_html/index.html)