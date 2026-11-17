# Live Session 2

- As the shell user, you don't have to call `fork`, `exec`, `wait` and `exit`. The shell automatically takes care of this.

- The stack pointer's current location is stored in a general-purpose register before jumping from the user stack to the kernel stack.

- Why don't we create an empty system image for a child process? Some instructions (in Windows) require the child to run the parent's code. We can't initialize an empty image. There are some advantages to copying the memory image of the parent into the child. The modern OSs utilize copy on demand.

  When a child is created, the PC points to the instruction after `fork()`. This prevents the OS from calling `fork()` recursively. `fork()` can return $$-1$$ instead of the child's PID if the process creation fails.

- `wait()` reaps only a **single** child process. We need to call it again if we need to reap more children. With some variants of `wait()`, we can delete a specific child. 

  `wait()` is designed this way so that the parent knows which child has been reaped. This information is important for later instructions. Returning an array of variable size is not a feasible option.

  