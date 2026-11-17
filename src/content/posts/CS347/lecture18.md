# Lecture 18 - Files and Directories

## The file abstraction

A ***file*** is simply a linear array of bytes, stored persistently. It is identified with a file name and also has a OS-level identifier - ***`inode` number***. 

A ***directory*** contains other subdirectories and files, along with their inode numbers. A directory is stored like a file whose contents are filename-to-inode mappings. You can think of a directory as a special type of file.

## Directory tree

Files and directories are arranged in a tree, start with root (`/`). 

## Operations on files

We can create a file using the `open` system call with a flag to create. It returns a number called **file descriptor** which is used as a file handle in the program.

```c
int fd = open("foo", O_CREAT|O_WRONLY|O_TRUNC, S_IRUSR|S_IWUSR);
```

We also open an existing file with the same system call. This must be done before reading or writing to a file. All other operations on files use the file descriptor. Finally, the `close` system call closes the file.

Other operations on a file are - 

- `read`/`write` system calls. These occur sequentially by default. Successive read/write calls fetch from the current offset. The arguments to these functions are file descriptor, buffer with data and size.
- To read/write at a random location in the file, we use `lseek` system call that lets us seek to a random offset. 
- Writes are buffered in memory temporarily and are flushed using `fsync`.
- There are other operations to rename files, delete (unlink) files, or get statistics of a file.

## Operations on directories

Directories can also be accessed like files. For example, the `ls` program opens and reads all directory entries. A directory entry contains file name, inode number,  type of file, etc.

**Note**. All the shell commands are simply C programs compiled into executables.

## Hard Links

Hard linking creates another file that points to the same inode number (and hence, same underlying data). If one file is deleted, file data can be accessed through the other links! inode maintains a link count, and the file data is deleted only when no further links exist to the data. You can only unlink, and the OS decides when to delete the data.

## Soft links or symbolic links

Soft link is a file that simply stores a pointer to another filename. However, if the main file is deleted, then the link points to an invalid entry - **dangling reference**.

## Mounting a filesystem

Mounting a filesystem connects the files to a specific point in the directory tree. Several devices and file systems are mounted on a typical machine and are accessed using `mount` command.

## Memory mapping a file

There exists an alternate way of accessing a file, instead of using file descriptors and read/write system calls. `mmap` allocates a page in the virtual address space of a process. We can ask for an **anonymous** page to store program data or a **file-backed** page that contains data of a file. When a file is mmaped, file data is copied into one or more pages in memory and can be accessed like any other memory location in the program. This way, we can conveniently read/write into the file from the program itself.