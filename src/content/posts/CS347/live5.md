# Live Session 5

- **Dirty bit** -The MMU sets this bit (unlike the present bit and valid bit, which are set by the OS) when the page is recently swapped into the memory. The OS needs this while evicting pages from the memory.

  Basically, when you swap in a page frame from the disk to the main memory, you **copy-paste** the frame. When the page in the main memory is modified, it is not in sync with the page in the disk. At this point, the MMU **sets** the **dirty bit**.

- A page can be in

  - Swap
  - Main Memory
  - Unallocated

  Now, note that all of the 4GB memory space need not be allocated.

  When the address is not allocated at all, the **valid bit** is **unset**. Whenever a virtual address is accessed, and consequently, the memory is allocated (allocated in the main memory), the **valid bit** is set. This memory allocation is triggered by a **page fault**. Initially, the newly allocated memory has the **present bit set** (since we just allocated the memory, we will use it). A page is swapped into the disk when not in active use, and the **present bit** is **unset**.

- Access bit is **set** whenever  a page is accessed. The bit is unset periodically by the OS.

- The device driver maintains a queue to process multiple reads/writes to the disk.

- The OS code is mapped into the virtual address space of the processes. It has all the OS information, PCBs, etc. This way, there wouldn't be much hassle during context switching. The page table of a process also has entries for the OS code. 

  The OS memory inside the process memory can increase. If it takes too much space, the modern OS has some techniques to prevent the OS space from encroaching the process's memory space.

  A PTE also has **permission bits** that prevent the user code from accessing the OS code. When the program has to access the OS code, the **trap instruction** switches us into a higher privilege level and moves us into the OS code.

  After we enter the kernel mode, we still cannot modify the OS code in any way we want. This is because we enter the kernel mode using thoroughly defined system calls.

  Remember, the `int n` instruction is run by the **hardware**.

- Every time the page table is updated, the TLB has to be updated too. This is done via special instructions.

- The user code runs natively on the CPU. The OS asks the CPU to execute the instructions sequentially. Then, the OS is out of the picture. All the memory fetches are done via the CPU.

  Now, you may think, when does the OS actually be involved in the memory access. The OS has to periodically check over the processes (maybe during access bit updates). Even when system calls are made, the OS has a play.

- There is a hardware register where the address of the page table is stored. The MMU accesses the page table using this address.