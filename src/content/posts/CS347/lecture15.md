## Lecture 15 - Semaphores

We are going to study another synchronization primitive called semaphores.

## What is a semaphore?

They are very similar to condition variables. It is a variable with an underlying counter. You can call two functions on a semaphore variable -

- `up/post` increment the counter
- `down/wait` decrement the counter and block the calling thread if the resulting value is negative.

The above two functions represent the interface to a semaphore. A semaphore with an initial value of 1 acts as a simple lock. That is, a binary semaphore is equivalent to a mutex. Here is a simple usage of a binary semaphore.

```c
sem_t m;
sem_init(&m, 0, X); // X can be 1 here
sem_wait(&m);
// Critical section
sem_post(&m);
```

## Semaphores for Ordering

They can be used to set the order of execution between threads like a CV. This example is similar to what we have seen before with the ["parent waiting for child"](#condition-variables) example. An important point to note here is that the semaphore is initialized to 0 here. Why? Because the parent has to wait for the child to finish. 

```c
sem_t s;
void* child (void *arg)
{
	printf("child\n");
	sem_post(&s);
	return NULL; // Line *
}

int main(int argc, chara *argv[])
{
	sem_init(&s, 0, 0);
	printf("parent: begin\n");
	pthread_t c;
	Pthread_create(&c, NULL, child, NULL);
	sem_wait(&s);
	printf("parent: end\n");
	return 0;
}
```

> What if line * had a print statement? Where would that get printed?

Therefore, it is essential to correctly determine the initial value of the semaphore for correct behavior. 

## Producer/Consumer Problem (1)

Let us revisit [this](#producerconsumer-problem) problem in the context of semaphores. We need one semaphore to keep track of empty slots and another to keep track of full slots. The producer waits if there are no more empty slots, and the consumer waits if there are no more full slots. Also, we need another semaphore to act as a mutex for the buffer. Here is how these variables are initialized.

```c
int main(int argc, char *argv[])
{
	// ...
	sem_init(&empty, 0, MAX);
	sem_init(&full, 0, 0);
	sem_init(&mutex, 0, 1); // Thumb rule - Locks are initialized with value 1
	// ...
}
```

There is a subtle point in this example. Consider the `producer` function.

```c
void* producer (void *arg)
{
	for(int i = 0; i < loops; ++i)
	{
		sem_wait(&empty);
		sem_wait(&mutex);
		put(i);
		sem_post(&mutex);
		sem_post(&full);
	}
}
```

*\** What if we acquire mutex before checking the other semaphores? It would result in a deadlock situation. The waiting thread can sleep with the mutex, and the signaling thread can never wake it up!







