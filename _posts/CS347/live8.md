# Live Session 8

- If you disable interrupts on all cores anyway, nothing bad happens. There are no emergency interrupts which might destroy your system if not handled immediately.
- semaphores no need to acquire lock. cv need to acquire lock. cv reacquires lock too.
- no context switch on post!

## Synchronization problems

### Question 26

Allowing N guests all at once into the house.

```c
// host
lock(m)
while(guest_count < N)
	wait(cv_host, m)
openDoor()
signal(cv_guest)
// signalbroadcast too
unlock(m)

// Guests code?
lock(m)
guest_count++
if(guest_count == N)
	signal(cv_host)
wait(cv_guest, m)
signal(cv_guest) // To signal other threads
    // above line not needed if singal braodcast is there
unlock(m)
enterHouse()
```

Whenever you write code, start with the wait signals. Then, put the logic in place and ensure there are no deadlocks. Also, pair up every wait with a signal.

### Question 25

Passenger thread given - 

```pseudocode
down(mutex)
waiting_count++
up(mutex)
down(bus_arrived)
board()
up(passenger_boarded)
```

Bus code?

```pseudocode
down(mutex)
N = min(waiting_count, K)
for i = 1 to N
    up(bus_arrived)
    down(passenger_boarded)
waiting_count -= N;
up(mutex)
```

