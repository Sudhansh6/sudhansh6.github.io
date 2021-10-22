# Lecture 17 - Communication with I/O devices

I/O devices connect to the CPU and memory via a bus. For example, a high speed bus, e.g., PCI and others like SCSI, USB, SATA, etc. The point of connection to the system is called the ***port***.

## Simple Device Model

Devices are of two types - 

- Block devices - The stored a set of numbered blocks. For ex, disks.
- Character devices - Produce/consume stream of bytes. For ex, keyboard.

All these devices expose an interface of memory registers. These registers tell the current status of the device, command to execute, and the data to transfer. The remaining internals of the device are usually hidden. There might be a CPU, memory, and other chips inside the device.

## Interaction with the OS

There are **explicit I/O** instructions provided by the hardware to read/write to registers in the interface. For example, on x86, `in` and `out` instructions can be used to read and write to specific registers on a device. These are privileged instructions accessed by the OS. A user program has to execute a system call in order to interact with the devices. 

The other way to do this is via the **memory mapped I/O**. The devices makes registers appear like memory locations. The OS simply reads and writes from memory. The underlying memory hardware routes the accesses to these special memory addresses to devices.

> What memory hardware?

## Simple execution of I/O requests

```c
While STATUS == BUSY
; //wait
Write data to DATA register
Write command to COMMAND register
White STATUS == BUSY
; // wait till device is done with request
```

The above pseudocode is a simple protocol to communicate with an I/O device. The **polling** status to see of device is ready wastes a lot of CPU cycles. The **Programmed I/O** explicitly copies data to/from device. The CPU need to be involved in this task.

## Interrupts

As polling wastes CPU cycles, the OS can put the process to sleep and switch to another process. When the I/O request completes,  the device raises an interrupt.  

The interrupt switches process to kernel mode. The Interrupt Descriptor Table (IDT) stores pointers to interrupt handlers (interrupt service routines). The interrupt (IRQ) number identifies the interrupt handler to run for a device. 

The interrupt handler acts upon device notification, unblocks the process waiting for I/O, and starts the next I/O request. Also, handling interrupts imposes kernel mode transition overheads. As a result, polling may be faster than interrupts if devices is fast.

## Direct Memory Access

The CPU cycles are wasted in copying data to/from device. Instead, we can use a special piece of hardware (DMA engine, seen in CS305) copies from main memory to device. The CPU gives DMA engine the memory location of data. In case of a read, the interrupt is raised after DMA completes. On the other hand, in case of a write, the disk starts writing after DMA completes.

> huh?

## Device Driver

The part of the OS code that talks to the specific device, gives commands, handles interrupts etc. Most of the OS code abstracts the device details. For example, the file system code is written on top of a generic block interface. the underneath implementation is done via the device drivers.