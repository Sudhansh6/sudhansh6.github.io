---

layout: post
title: Handling broken python packages 
categories: [Articles, Ubuntu]
comments: true
excerpt: A post to guide you through mending python libraries on Ubuntu

---

If you knowingly or unknowingly deleted python files from your Ubuntu, this article is for you. Although a disclaimer: I'm not highly versed with operating systems, this makeshift method seems to fix the problem. I spent a rather frustrating day trying to get out of this situation, and I did not find a single good resource. So, I planned to write out this post to consolidate all the fixes that may resolve the issue. If none of the methods work, your best bet is to reinstall Ubuntu entirely without any hassle.

# How I stumbled across the problem

I love updating my OS to the latest build available. On account of this, I updated my Ubuntu to [21.04 Hirsute Hippo](https://releases.ubuntu.com/21.04/) yesterday. The update took 3-4 hours to finish, and I was delighted with the new OS. After wasting a whole day updating the OS and testing out [Windows 11](https://sudhansh6.github.io/posts/Windows-11), I decided I should get back to work.

I started out with a project which requires python. On executing, the code (which was working previously) gave an error saying some modules were missing. I realized the new OS update had replaced `python3.8` with `python3.9`. I was annoyed thinking that all my modules were deleted during the update.

To check this, I headed out to `/usr/lib/` to check for the same. I saw no trace of `python3.8`, and there were 5 other versions of python installed. I was foolish enough to think those versions were unnecessary, and I unwittingly deleted `python2.7` and `python3`. Deleting these files required `sudo` and `root` access, and for a good reason. This action initiated my day of incessant browsing and fruitless fixing attempts. 

I later learned that all my modules of `python3.8` were safe in the local installation at `/usr/local/lib`. I wish I knew this before. Anyway, once I deleted those files, everything started malfunctioning. `apt` and `dpkg` gave errors, and the terminal was not opening too!

# How to fix the problem?

Before I go into what finally restored my software, I'll list out a couple of commands I came across. If you are lucky, these might just solve your problem.

## <a name=standard>Method 1: Using `apt` and `dpkg`</a>

Try the following commands:

1. ```bash
   sudo apt-get -f install
   ```

   According to `man apt-get`, the `-f` or `--fix-broken` flag is an attempt to correct a system with broken dependencies in place. When used with install/remove, this option can omit any packages to permit APT to deduce a possible solution.

2. The above does not work when a system's dependency structure can be so corrupt as to require manual intervention. Then, you can try

   ```bash
   sudo dpkg --configure -a 
   ```

   This command configures all unpacked packages.

## Method 2: Relinking links and binaries

The above was a cleaner fix using the package installers themselves. Now, we enter the makeshift regime. If you simply deleted `usr/bin/python*`, the following may work:

```bash
sudo apt-get install --reinstall python*-minimal
# Replace the * with the required version. For example, for python2.7 use:
sudo apt-get install --reinstall python2.7-minimal
```

> In case your terminal is not working, you can try this:
>
> - If you have Visual Studio Code installed, use the inbuilt terminal to execute the above.
> - If xterm is installed, try using that.
> - Otherwise, just access a [tty](https://askubuntu.com/questions/66195/what-is-a-tty-and-how-do-i-access-a-tty) using `Ctrl + Alt + F[1-6]` and execute the above.

​	If only the <a name=symlink>[**symbolic links**](https://www.freecodecamp.org/news/symlink-tutorial-in-linux-how-to-create-and-remove-a-symbolic-link/)</a> are broken, you can simply create a new link and restore your system.

​	Usually, a `python3` link points to the `python3.*` binary executable. Suppose you have `python3.8` installed, you 	      	can create a symlink using:

```bash
# Creates a symbolic link to python3.8 from python3
sudo ln -s /usr/bin/python3.8 /usr/bin/python3
```

## Method 3: My Hack

 Without further ado, let me tell you what worked for me. My idea was to copy the correct files from a faultless installation of Ubuntu. It is unlikely that you have these files (if you do, then skip to [this](#Restoring-everything)), and you need to create a bootable to get these. 

### Creating a bootable

The first step is to download the `iso` file from the [Ubuntu website](https://ubuntu.com/download) and acquire an empty USB stick.

If your terminal is not working, it is improbable that the [*Startup Disk Creator*](https://ubuntu.com/tutorials/create-a-usb-stick-on-ubuntu#1-overview) tool works. Therefore, we will use a CLI tool called **ddrescue** to create the bootable.

```bash
sudo apt install gddrescue
```

This is expected to work if `apt` is not entirely broken. Next, we check the block device volume of the USB drive (I hope you plugged in your USB). 

```bash
lsblk
```

The USB drive may be present in `dev/sdb/`. Then, we simply use the following to create the bootable

```bash
sudo ddrescue path/to.iso dev/sd* -- force -D
# For example, if USB is present in sdb use
sudo ddrescue ~/ubuntu-21.04-desktop-amd64.iso /dev/sdb --force -D
```

This may take a few minutes, and your USB will be ready after this.

### Copying working files

If your system has only Ubuntu installed, then you might be able to reinstall Ubuntu, keeping your data intact. Otherwise, use the 'Try Ubuntu' option.

Once the OS loads, open the file explorer. Copy the `usr/bin/` and `usr/lib/` folder from the Ubuntu instance running on your USB to some location (say `foo/` on your hard drive). If you do not have the permissions to do so, use this in the destination directory

```bash
sudo chmod -R 777 .
```

Restart the system again, unplug the USB, and boot into Ubuntu.

### <a name="Restoring-everything">Restoring everything</a>

This part is straightforward, but we must proceed with care.

Open up the `foo/usr/bin/` folder from the files you copied and the `usr/bin/` in your system. List all the files relevant to python using:

```bash
ls -l | grep python
```

Delete the existing executables, and then copy the python executables first using

```bash
sudo rm /usr/bin/python3.8
sudo mv foo/usr/bin/python3.8 /usr/bin/python3.8
```

We then create the symbolic links as present in `foo/usr/bin/` using the command mentioned [above](#symlink). This fixes the `/bin/` folder. Now, do the same in the `lib` folder. Copy `python3` and `python3.9` (these two are present if you are using Ubuntu 21.04) into `usr/lib/`

```bash
sudo rm -R /usr/lib/python3
sudo mv -R foo/usr/lib/python3 /usr/lib
```

Change the ownership of the copied files to root using:

```bash
sudo chown root:root /usr/bin/python3.8
sudo chown -R root:root /usr/bin/python3
```

After transferring the files, repeat [these](#standard) to patch everything up. You're done!

