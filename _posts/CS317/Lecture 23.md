# Lecture 23

> `07-03-22`

**Software RAID** vs. **Hardware RAID**. Copies are written sequentially to guard against corruption in case of power failure. There are couple of hardware issues

- **Latent sector failures** - Data successfully written earlier gets damaged which can result in data loss even if only one disk fails.
- **Data scrubbing** - Continuous scans for latent failures, and recover from copy/parity.
- **Hot swapping** - Replacement of disk while the system is running without powering it down. This reduces the time to recovery, and some hardware RAID systems support this.

# ~Chapter 13: Data Storage Structures

## File Organization

The database is stored as a collection of *files*. Each file is a sequence of *records*, and each record is a sequence of fields. We will assume the following

- Fixed record size
- Each file has records of one particular type only
- Different files are used for different relations
- Records are smaller than a disk block

### Variable name records

