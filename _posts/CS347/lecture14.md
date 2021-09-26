# Lecture 14 - Condition variables

Locks allow one type of synchronization between threads. There is another typical requirement in multi-threaded applications. It is known as **waiting and signaling**. Here, one thread might want another thread to finish the job and signal to the original thread when the job is executed. We can accomplish such synchronization using *busy-waiting*, but it is inefficient. Therefore, most modern OS have a new synchronization primitive - **condition variables** (as called in `pthreads`).

## Condition Variables

A condition variable (CV) is a queue that a thread can be placed into when waiting on some condition. Another thread can wake up the waiting thread by signaling CV after making the condition true. `pthreads` provides CV for user programs and also for kernel threads. There are two kinds of signaling - 

- A signal wakes up a single thread
- A signal broadcast that wakes up all the waiting threads.

Here is an example utilizing CV - 

```c
int done = 0;
pthread_mutex_t m = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t c = PTHREAD_COND_INITIALIZER;
void thr_join(){
Pthread_mutex_lock(&m); // Line *
while(done == 0)
	Pthread_cond_wait(&c, &m); //Parent thread goes to sleep
	Pthread_mutex_unlock(&m);
}
void thr_exit() {
	Pthread_mutex_lock(&m);
	done = 1;
	Pthread_cond_signal(&c); // Send a signal
	Pthread_mutex_unlock(&m);
}
void *child (void *arg)
{
	printf("child\n");
	thr_exit();
	return NULL;
}
int main ()
{
	printf("Parent - begin\n");
	pthread_t p;
	Pthread_create(&p, NULL, child, NULL);
	thr_join;
	printf("Parent - end\n");
}
```

> Doesn't the parent already wait in line * if the child is executed before?
>
> What if the parent acquires lock first? The wait function releases the lock. See below.

In the above example, it doesn't matter which thread (child/parent) gets executed first. The flow is still the same as expected. Note that it is always better to check the condition (in the `while` loop) before waiting. Otherwise, the parent thread will not be woken up. 

Why do we use a `while` instead of `if`? To avoid corner cases of thread being woken up even when the condition is not true (maybe an issue with some implementation). This is a good programming practice. 

Why do we hold locks before checking the condition? What if we didn't use a lock? There would be a race condition for a missed wakeup

- Parent checks done to be 0, decides to sleep and is then interrupted.
- The child runs, sets done to 1, signals, but no one is sleeping.
- The parent now resumes and goes to sleep forever.

Therefore, a lock must be held when calling wait and signal with CV. The wait function releases the lock before putting the thread to sleep, so the lock is available for the signaling thread.

## Producer/Consumer Problem

This setting is a common pattern in multi-threaded programs. There are two pr more threads - producer(s) and consumer(s) which share a shared buffer (having a finite size). We need mutual exclusion in the buffer, and also a signaling mechanism to share information. 

For example, in a multi-threaded web server, one thread accepts requests from the network and puts them in a queue. The worker threads get requests from this queue and process them. Here's how we implement this - 

```c
cond_t empty, fill;
mutex_t mutex;
void *producer(void *arg)
{
    int i;
    for (i = 0; i < lopps; i++)
    {
        Pthread_mutex_lock(&mutex);
        while(count == MAX)
        	Pthread_cont_wait(&empty, &mutex);
        	put(i);
        	Pthread_cond_signal(&fill);
        	Pthread_mutex_unlock(&mutex);
    }
}

void *consumer(void *arg)
{
	int i;
	for (i = 0; i < loops, i++)
	{
		Pthread_mutex_lock(&mutex);
		while(count == 0)
			Pthread_cond_wait(&fill, &mutex);
		int tmp = get();
		Pthread_cond_signal(&empty);
		Pthread_mutex_unlock(&mutex);
		printf("%d\n", tmp);
	}
}
```

