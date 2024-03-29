# Live Session 6

- Why do we have `walkpgdir` in `copyuvm`? ~~Aren't page tables contiguous? Self-answered: The `copyuvm` function copies entire pages. The `walkpgdir` is only for the outer page directory.~~

  `walkpgdir` simply returns the PFN of the input VPN, and allocates a new inner page if necessary. Therefore, there is no redundancy!

- Why is the kernel allocation memory from its free pages to the user processes? The purpose of double mapping in virtual space.

  Think of it this way. The true RAM of your computer is only from `0` to `PHYSTOP`. Every piece of allocated memory comes from `0` to `PHYSTOP`, and this maps to both kernel and user part of the memory image of a process. Yes, it's naive! Modern Operating systems have other optimizations.

- In line 2600 of `fork` system call, why do we copy trapframe again? `uvm` in `copyuvm` means user virtual memory. This function only copies the user part of the memory. The kernel stack and other structures are built using `allocproc`. You have to manually copy the `struct proc` data or any other kernel data for that matter.

- **Note**. A process can think it has $$1$$TB of memory too! The present bit takes care of this.

- The OS does not take part in every memory access. Why?

  The OS is only in play when the process is being initialised, page faults, or when it is being context switched. Otherwise, the MMU + TLB take care of the address translations. Therefore, the MMU also needs to perform checks on the virtual address and ensure the query is not invalid. 

