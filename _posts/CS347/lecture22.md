# Lecture 22: Processes in xv6

## The process abstraction

The OS is responsible for concurrently running multiple processes (on one or more CPU cores/processors)

- Create, run, terminate a process
- Context switch from one process to another
- Handle any events (e.g., system calls from process)

OS maintains all information about an active process in a process control block (PCB)

- Set of PCBs of all active processes is a critical kernel data structure
- Maintained as part of kernel memory (part of RAM that stores kernel code and data, more on this later)

PCB is known by different names in different OS

- `structproc` in xv6
- `task_struct` in Linux

## PCB in xv6: struct proc

The different states of a process in xv6 (`procstate`) are given by `UNUSED, EMBRYO (new), SLEEPING (blocked), RUNNABLE (ready), RUNNING, ZOMBIE (dead)`

The `struct proc` has

- Size of the process
- Pointer to the apge table
- Bottom of the kernel stack for this process
- Process state
- Process ID
- Parent process
- Pointer to folder in which process is running
- Some more stuff which we will study later

### Kernel Stack

Register state (CPU context) is saved on user stack during the function calls to restore/resume later. Likewise, the CPU context is stored on ***kernel stack*** when process jumps into OS to run kernel code.

We use a separate stack because the OS does not trust the user stack. It is a separate area of memory per process within the kernel, not accessible by regular user code. It is linked from `struct proc` of a process.

### List of open files

Array of pointers to open files (`struct file` has info about the open file)

- When user opens a file, a new entry is created in this array, 
  and the index of that entry is passed as a file descriptor to 
  user
- Subsequent read/write calls on a file use this file 
  descriptor to refer to the file
- First 3 files (array indices 0,1,2) open by default for every process: standard input, output and error

- Subsequent files opened by a process will occupy later entries in the array

### Page table

Every instruction or data item in the memory image of process has an address. Page table of a process maintains a mapping between the virtual addresses and physical addresses.

## Process table (`ptable`) in xv6

It has a lock for protection. It is an array of all processes. Real kernels have dynamic-sized data structures. However, xv6 being a dummy OS, has a static array.

A CPU scheduler in the OS loops over all runnable processes, picks one, and sets it running on the CPU.

## Process state transtition examples

A process that needs to sleep will set its state to `SLEEPING` and invoke scheduler.

A process that has run for its fair share will set itself to `RUNNABLE` and invoke Scheduler. The Scheduler will once again find another `RUNNABLE` process and set it to `RUNNING`.