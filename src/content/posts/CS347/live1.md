# Live Session 1

- *Real memory* is less than *virtual memory*. It is easier to let the process think it has the whole memory rather than telling it how much memory it exactly has.
- Memory for Global variables and Function variables is allocated once! We don't know how many times each function will be called. Therefore, we just assign it once and use the allocated space for repeated calls.
- We have *caller* and *callee* registers for storing existing computations in the registers before a function call. We can't have only one set (callee or caller) store all these values due to some subtle reasons. A caller save register would have to pass some arguments. A callee save register would have to return some arguments. To avoid all this, we have a separate set of caller and callee registers.
- "Only one process can run on a core at any time". Basically that the OS sees the processor as two different cores in hyper-threading. Therefore, it can run a *single* process on a *core*.
- *xv6* is primarily written in C. If we need an OS to compile and run a program, how do we run xv6? Whenever you boot a system with an OS, you use an existing OS to build the binaries for the needed OS. Then, you run the binary to run the OS. To answer the chicken and egg problem, someone might've written an OS in assembly code initially.
- OS keeps track of locations of memory images using **page tables**.
- Virtual addresses of an array will be contiguous, but the OS may not allocate contiguous memory.
- When we print the address of a pointer, we get the **virtual address** of the variable. Exposing the real address is a security risk.