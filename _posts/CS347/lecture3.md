# Lecture 3 - Process API

We will discuss the API that the OS provides to create and manage processes.

## What is the API?

So, the API refers to the functions available to write user programs. The API provided by the OS is a set of **system calls**. Recall, a system call is like a function call, but it runs at a higher privilege level. System calls can perform sensitive operations like access to hardware. Some "blocking" system calls cause the process to be blocked and unscheduled (e.g., `read` from disk).

## Do we have to rewrite programs for each OS?

No, we don't. This is possible due to the ***POSIX API***. This is a standard set of system calls that OS must implement. Programs written to the POSIX API can run on any POSIX compatible OS. Almost every modern OS has this implemented, which ensures program portability. Program language libraries hide the details of invoking system calls. This way, the user does not have to worry about explicitly invoking system calls.

For ex, the `printf` function in the C library calls the `write` system call to write to the screen.

## Process related system calls (in Unix)

The most important system call to create a process is the **`fork()`** system call. It creates a new **child** process. All processes are created by forking from a parent. The **`init`** process is the ancestor of all processes. When the OS boots up, it creates the `init` process.

**`exec()`** makes a process execute a given executable.  **`exit()`** terminates a process, and **`wait()`** causes a parent to block until a child terminates. Many variants of the above system calls exist with different arguments.

## What happens during a fork?

A new process is created by making a copy of the parent's memory image. This means the child's code is exactly the same as the parent's code. The new process is added to the [OS process list](os-data-structures) and scheduled. Parent and child start execution just after the fork statement (with different return values).

Note that parent and child execute and modify the memory data independently (the memory images being a  copy of one another does not propagate).

The return values for `fork()` are set as follows:

- `0` for the child process
- `< 0` if `fork` failed
- `PID of the child` in the parent

## Terminating child processes

A process can be terminated in the following situations

- The process calls `exit()` (`exit()` is called automatically when the end of main is reached)
- OS terminated a misbehaving process

The processes are not immediately deleted from the process list upon termination. They exist as zombies. These are cleared out when a parent calls `wait(NULL)`. A zombie child is then cleaned up or "reaped".

`wait()` **blocks the parent** until the child terminates. There are some non-blocking ways to invoke wait.

What if the parent terminates before its child? `init` process adopts orphans and reaps them. Dark, right? If the `init` process does not do this, zombies will eat up the system memory. Why do we need zombies? (Too many brains in the world). There are subtle reasons for this, which are out of scope for this discussion.

## What happens during exec?

After forking, the parent and the child are running the same code. This is not useful! A process can run `exec()` to **load** another executable to its memory image. This allows a child to run a different program from the parent. There are variants of `exec()`, e.g., `execvp()`, to pass command-line arguments to the new executable.

## Case study: How does a shell work?

In a basic OS, the `init` process is created after the initialization of hardware. The `init` spawns a lot of new processes like `bash`. **`bash`** is a shell. A shell reads user commands, forks a child, execs the command executable, waits for it to finish, and reads the next command.

Standard commands like `ls` are all executables that are simply `exec`'ed by the shell.

## More funky things about the shell

A shell can manipulate the child in strange ways. For example, you can redirect the output from a command to a file.

```shell
prompt > ls > foo.txt
```

This is done via spawning a child, rewires its standard output to a file, and then calls the executable.

```c
close(STDOUT_FILENO);
open("./p4.output", O_CREAT|O_WRONLY|O_TRUNC, S_IRWXU);
```

We can similarly modify the input for a process.