---
layout: post
title: Programming Cheatsheet
categories: [Articles]
excerpt: A quick overview of all the important concepts in DSA.
---

<script type="text/javascript" async src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/latest.js?config=TeX-MML-AM_CHTML" async></script>

# Data Structures

## Arrays

### Vector syntax

- `vector<type>` stores elements of the type `type`. They are indexed by `ints`. 
- Initialise a vector with `n` elements with all equal to `m` using `vector<type> vec(n, m)`.
- Copy a part of another vector in a new vector using `vector<type> cpy(m.begin(), m.end())`.
- `vector<type>::iterator` for an iterator through a vector. The special thing about iterators is that they provide the glue between [algorithms and containers](https://stackoverflow.com/a/11948413/819272). You can use `int` for indexing contiguous data structures such as `vector`
- **Sort** a vector using `sort(v.begin(), v.end(), [](auto a, auto b){return a < b;})`.
- **Rotate** a vector by `k` indices to the *right* using `::rotate(nums.begin(), nums.end() - k%size, nums.end());`.
- **Reverse** a vector using `reverse(v.begin(), v.end())`.
- **Length** of a vector is given by `v.size()` and not `v.length()`.
- Finding max sub array and max sub sequence

```cpp
vector<int> maxSubarray(vector<int> arr) {
int prev = INT_MIN, sarr = INT_MIN, sseq = 0, M = INT_MIN;
for(int i = arr.size() - 1; i >= 0; --i)
{
    prev = max(0, prev) + arr[i];
    sarr = max(sarr, prev);
    if(arr[i] >= 0) sseq += arr[i];
    M = max(M, arr[i]);
}
if (sseq == 0) sseq = M;
vector<int> res = {sarr, sseq};
return res;
}
```

- Visit [here](https://www.geeksforgeeks.org/accumulate-and-partial_sum-in-c-stl-numeric-header/) for finding sum and partial sums of vector.

## Strings

First, all the syntax from `<string>` library.

- **Length** of a string is given by `str.length()`.
- **Reverse** a string using `reverse(str)` . If you want to store the reversed string elsewhere, use *reverse iterators* and do the following `string res = string(str.rbegin(), str.rend())`. Yes! strings have iterators.
- **Transform** a string using `transform(in.begin(), in.end(), out.begin(), ::tolower)`. `in` can be `out`.
- **Filter** alphabets from a string/**iterable** using `remove_if(vec2.begin(), vec2.end(), [](auto c){return !::isalpha(c);})`. **The above does not work perfectly**. Use `s.erase(::remove_if(s.begin(), s.end(), [](auto c){return !::isalpha(c);}), s.end());`.
- `::tolower` affects only alphabets in a string.
- **Compare** characters with **single quotes**.
- Refer to this [link](https://www.javatpoint.com/cpp-strings) for all string functions in C++. [Here](https://fresh2refresh.com/c-programming/c-strings/c-strstr-function/) is another list of useful string functions.
- String to number using `atoi()` and `stoi()`. Number to string conversion using `to_string()`.
- Use `push_back` **or** `+` to add new chars at the end. Use `a + b` to **concatenate** strings.
- Use `size_t` for storing lengths of strings.

### Theory

- Storing strings in `char` arrays. Allocate space equal to **one more** than the length of string of array. The last character is for the **end** character: `\0`. Strings in C must end with the null character. Suppose you try to print a string without the end character, the program will print characters until it encounters the null character. Functions like  `strlen` and `printf("%s", char_array)` depend on the end character.
- You can also initialise a string using 'double quotes'. For example, `char arr[100] = "Null character is implictly placed"`.  You can also *avoid writing the size*. Although, when you initialise the string with comma separated characters,  you must mention the size. Also, you must explicitly mention the end character.
- Arrays and pointers are different types used in a similar manner. Let `p1` be an array and `p2` be a pointer. **`p2 = p1`** is valid but **`p1 = p2; ++p1` are invalid**.
- Arrays are always passed to a function **by reference**.
- Memory of an application is classified into :

|       Heap        |
| :---------------: |
|     **Stack**     |
| **Static/Global** |
|  **Code** (Text)  |

- ```cpp
  char C[20]  = "Hello"; //String gets stored in the space of the array. Can be edited.
  char *C2 = "Hello"; //String gets stored as a constant during compile time.
  // C2[0] = 'A'; would be invalid
  ```

- C++ provides `string` inbuilt datatype.

## Linked Lists

- You can't delete a node by just using `delete node`. You should do `prev -> next = node -> next` and then `delete node`. You should do this even if `node -> next = NULL`.
- **Reverse** a linked list in `O(n)` using a sliding window mechanism.

```cpp
if(head == NULL || head -> next == NULL) return head;
ListNode *prev, *curr, *next;
prev = head;
curr = head -> next;
head -> next = NULL;
while(curr -> next != NULL)
{
    next = curr -> next;
    curr -> next = prev;
    prev = curr;
    curr = next;
}
curr -> next = prev;
return curr;
```

- Check if a **cycle** exists in a linked list using the **Hare and Tortoise** algorithm.
- Check if a list is a **palindrome** in `O(n)` time and `O(1)` storage using the above two algorithms.
- In doubly linked lists, make sure you change both `prev` and `next` of the previous and following nodes.

## Queues and Stacks

| Operations      | Queues          | Stacks              |
| --------------- | --------------- | ------------------- |
| Adding elements | `queue.push()`  | `stack.push_back()` |
| First element   | `queue.front()` | `stack.top()`       |

- Stacks and queues can be implemented via arrays and linked lists.

##  Trees

- When you write recursive algorithms, make sure you write the base cases. Your base case can include `NULL` too! Don't write `left == NULL`, `right == NULL` etc separately. Let me show what I mean. Consider the problem of validating a BST. Initially, the code I wrote in python was this.

```python
def checker(root):
    if root.left == None and root.right == None:
        return [True, root.data, root.data]
    if root.right == None:
        left = root.left
        c_left = checker(left)
        return [c_left[2] < root.data and c_left[0], min(c_left[1], root.data), max(c_left[2], root.data)] 
    if root.left == None:
        right = root.right
        c_right = checker(right)
        return [c_right[1] > root.data and c_right[0], min(c_right[1], root.data), max(c_right[2], root.data)]
    left = root.left
    right = root.right
    c_left = checker(left)
    c_right = checker(right)
    m = min(c_left[1], c_right[1], root.data)
    M = max(c_left[2], c_right[2], root.data)
    return [c_left[2] < root.data and c_left[0] and c_right[1] > root.data and c_right[0], m, M] 
            
def checkBST(root):
    return checker(root)[0]
```

This is really ugly and redundant. Here is an equivalent solution in C++.

```cpp
bool validate(TreeNode* root, long m, long M)
    {
        if(root == NULL) return true;
        
        if(root -> val >= M || root -> val <= m) return false;
        return validate(root -> left, m, min(M, (long)root -> val)) && validate(root -> right, max((long)root -> val, m), M);
    }
    
    bool isValidBST(TreeNode* root) {
        return validate(root, (long)INT_MIN - 1, (long)INT_MAX + 1);
    }
```

**BSTs** **don't have** **duplicate values**. Using a Balanced Search Tree (**BST**), we can do the following:

```pseudocode
	1. Insert in O(log n)
        2. Delete in O(log n)
        3. Search for an element in O(log n)
        4. Find Min in O(log n)
        5. Find Max in O(log n)
        6. Get all the elements in sorted order in O(n) - Inorder traversal.
        7. Find an element closest in value to x O(log n)
```

[Hashmaps](#ashing) are also a great way to store elements but the following operations cannot be done efficiently in hash tables:

```pseudocode
        1. the min / max query in reasonable time
        2. Iterating through the element in sorted order in linear time
        3. Find an element closes to x in logarithmic time.
```

## Heaps and Maps

**Treemaps** are implemented internally using balanced trees ( They mostly use red black trees). Take a look at [this](https://stackoverflow.com/questions/6147242/heap-vs-binary-search-tree-bst) answer for comparison of Heaps and BSTs (Maps). 

### Implementation Details

**C++**. `map` and `set` from the STL library are implemented using balanced red-black trees. Maps are sorted via keys.

```cpp
/* Declaration */
map<int, int> A; // O(1) declaration which declares an empty tree map.
/* Inserting a key */
A[K] = V; // O(log n). Note that we expect key K to be unique here. If you have keys that will repeat, take a look at multimaps.
/* Delete a key */
A.erase(K); // O(log n)
/* Find a key */
A.find(K) != A.end()  // O(log n)
/* Find minimum key K in the map */
(A.begin())->first     // O(1)
/* Find maximum key K in the map */
(A.rbegin())->first     // O(1)
/* Find closest key K > x */
(A.upper_bound(x))->first     // O(log n). Do need to handle the case when x is more than or equal to the max key in the map. 
/* Find closest key K >= x */ // Use lower_bound
/* Iterate over the keys in sorted order */
for (map<int,int>::iterator it = A.begin(); it != A.end(); ++it) {
        // it->first has the key, it->second has the value. 
    }
```

**Python** - Python does not have treemap. The closest implementation is `heapq`.

```python
A = []; # declares an empty list / heap. O(1)
            # Note that heaps are internally implemented using lists for which heap[k] <= heap[2*k+1] and heap[k] <= heap[2*k+2] for all k. 
heapq.heappush(A, (K, V));     # O(log n)
heapq.heappop(A)[0] # Delete the 'smallest' key. Deleting random key is inefficient.
A[0][0] # minimum key
```

### Heapsort

Heap sort can be understood as the improved version of the binary  search tree. It does not create a node as in case of binary search tree  instead it builds the heap by adjusting the position of elements within  the array itself.

In which method a tree structure called heap is used where a heap is a type of binary tree. An ordered balanced binary tree is called a  **Min-heap**, where the value at the root of any subtree is less than or  equal to the value of either of its children.

An ordered balanced binary tree is called a **max heap** where the value  at the root of any subtree is more than or equal to the value of either  of its children.

**A heap is a tree data structure that satisfies the following properties:**

1. **Shape property**: Heap is always a complete binary  tree which means that all the levels of a tree are fully filled. There  should not be a node which has only one child. Every node except leaves  should have two children then only a heap is called as a complete binary tree.
2. **Heap property**: All nodes are either greater than or equal to or less than or equal to each of its children. This means if  the parent node is greater than the child node it is called as a max  heap. Whereas if the parent node is lesser than the child node it is  called as a min heap.

**Heapsort** implementation in **C++**

```cpp
// To heapify a subtree rooted with node i which is
// Heapify:- A process which helps regaining heap properties in tree after removal 
void heapify(int A[], int n, int i)
{
   int largest = i; // Initialize largest as root
   int left_child = 2 * i + 1; // left = 2*i + 1
   int right_child = 2 * i + 2; // right = 2*i + 2
   // If left child is larger than root
   if (left_child < n && A[left_child] > A[largest])
       largest = left_child;
   // If right child is larger than largest so far
   if (right_child < n && A[right_child] > A[largest])
       largest = right_child;
   // If largest is not root
   if (largest != i) {
       swap(A[i], A[largest]);
       // Recursively heapify the affected sub-tree
       heapify(A, n, largest);
   }
}
// main function to do heap sort
void heap_sort(int A[], int n)
{
   // Build heap (rearrange array)
   for (int i = n / 2 - 1; i >= 0; i--)
       heapify(A, n, i);
   // One by one extract an element from heap
   for (int i = n - 1; i >= 0; i--) {
       // Move current root to end
       swap(A[0], A[i]);
       // call max heapify on the reduced heap
       heapify(A, i, 0);
   }
}
```

# Important Topics

## Bit Manipulation

- Integer data types. 
  - If the **most-significant** byte is given the **highest** address then it is **Little-endian architecture**.
  - If the **most-significant** byte is given the **lowest** address then it is **Big-endian architecture**.
- 2's complement is given by adding 1 to inverted bits.
- `long long int` is stored in `8 bytes`.
- Get size of a data type using `sizeof(<datatype>)`.

### Tricks with bits

- `x & (x - 1)` will clear the lowest set bit of `x`.
- `x & ~(x - 1)` extracts the lowest set bit of `x`. 
- Check others [here](https://www.interviewbit.com/tutorial/tricks-with-bits/#tricks-with-bits). No, I was not lazy to write, they felt unimportant.

## Design

- You can generate a random number between 0 and 32767 using `rand()` in C++.

## Mathematics

- Counting the number of prime numbers. Follow the logic used in CS251. Initialise all numbers to primes. Make all multiples to false. Or more formally, follow what's called as **Eratosthenes sieve method**.
- Simple trick for questions like determine if a number `n` has the form $$a^x$$: Check `pow(a, max)% n == 0`!!!!

## Pointers

- int, float - 4 bytes of memory , char - 1 byte of memory
- Pointers for 2D arrays and general syntax -> [here](https://www.geeksforgeeks.org/pointer-array-array-pointer/)

## Others

- ```cpp
  int hammingWeight(uint32_t n) {
          int count=0;
          while(n){
              n=n&(n-1);
              count++;
          }
          return count;
      }
  ```


# Algorithms

## KMP - Knuth Morris Pratt

> Given a text `txt[0, ..., n-1]` and a pattern `pat[0, ..., m-1]`, write a function `search(char pat[], char txt[])` that prints all occurrences of `pat[]` in `txt[]`.

```cpp
// lsp[i] = the longest proper prefix of pat[0..i] which is also a suffix of pat[0..i]
vector<int> lsp(needle.length(), -1);
for(size_t i = 1; i < needle.length(); ++i)
{
    int j = lsp[i - 1] + 1;
    while(j != 0 && needle[j] != needle[i])
        j = lsp[j - 1] + 1;
    lsp[i] = j - 1;
    if(needle[j] == needle[i]) ++lsp[i];
}
// TIME COMPLEXITY - O(needle.length())
// STORAGE COMPLEXITY - O(needle.length())
```

Counting the occurrences of needle in haystack:

```cpp
size_t i = 0, j = 0;
for(; i < haystack.length(); ++i)
{
	if( j == needle.length()) 
	{
		++ANSWER;
		j = 0;
	}
   if(haystack[i] != needle[j])
   {
        if(j == 0) continue;
        j = lsp[j - 1] + 1;
        --i; 
   }
   else
       ++j;
}
// TIME COMPLEXITY - O(haystack.length() * needle.length()) - Worst case is "AAAAA", "AA"
// STORAGE COMPLEXITY - O(1)
```

**Other pattern matching algorithms** 

1. [Rabin - Karp algorithm](https://www.geeksforgeeks.org/rabin-karp-algorithm-for-pattern-searching/?ref=rp) - Something to do with hashes
2. [Boyer Moore algorithm](https://www.geeksforgeeks.org/boyer-moore-algorithm-for-pattern-searching/?ref=rp) - Something to do finding good and bad heuristics

There are many more algorithms which are covered [here](https://www.tutorialspoint.com/introduction-to-pattern-searching-algorithms).

## The two pointer technique

This technique is a clever optimization on some brute force approaches in certain conditions. Let us take an example to understand this concept. 

Suppose you have to find two indices in a sorted (non-decreasing) array such that the sum of values at those indices is zero. The naive `O(n^2)` approach would be to check every pair of indices satisfying this condition. 

```cpp
for (int i = 0; i < A.size(); i++) 
            for (int j = 0; j < A.size(); j++) {
                if (i != j && A[i] + A[j] == 0) return true; // solution found. 
                if (A[i] + A[j] > 0) break; // Clearly A[i] + A[j] would increase as j increases
            }
```

Although, let us make some keen observations in this method.  When `i` increases, `A[i]` increases, and the breaking point of the inner loop decreases. Also, the inner loop need not run till `A.size() - 1` but can end before `j = i`.

We can rewrite the code such that the value of `j` starts from the end of the array and goes till `i`. In that case, we would break the inner loop when the sum goes *below* 0. And similarly, as `i` increases, the breaking point would decrease. 

Now, the value of the sum at the breaking point of the **previous** iteration will be positive as `A[i]` increases with `i`. Therefore, the iterations of the inner loop can begin from the breaking point of the previous iteration. In other words, consider the following code.

```cpp
int j = A.size() - 1;    
        for (int i = 0; i < A.size(); i++) 
            for (; j > i; j--) {
                if (i != j && A[i] + A[j] == 0) return true; // solution found. 
                if (A[i] + A[j] < 0) break; // Clearly A[i] + A[j] would decrease as j decreases.
            }
```

Consider the time analysis of this code. `i` only moves forward and `j` only moves backward. Therefore, this code runs in `O(n)`.

In general, all two pointer approach work similarly. You look at the  naive solution involving multiple loops and then you start analyzing the pattern on each loop. 
Try to look for monotonicity in one of the loops as other loops move  forward. If you find that, you have found your optimization.

## Dijkstra's Algorithm - Graphs

Refer [here](#dijkstra's-algorithm).

# Sorting

- **C++ ->** **`sort(v.begin(), v.end());`** 
- **Python -> `v.sort()`**
- My best implementation of merging algorithm in merge sort:

```cpp
vector<int> res(m + n, 0);
int i = 0, j = 0, c = 0;
for(; i < n && j < m;)
    if(nums2[i] < nums1[j])     res[c++] = nums2[i++];
    else    res[c++] = nums1[j++];
while(i != n)   res[c++] = nums2[i++];
while(j != m)   res[c++] = nums1[j++];
```

### Insertion Sort 

```cpp
INSERTION-SORT(A)
   for i = 1 to n
   	key ← A [i]
    	j ← i – 1
  	 while j > = 0 and A[j] > key
   		A[j+1] ← A[j]
   		j ← j – 1
   	End while 
   	A[j+1] ← key
  End for 
```

### Quick Sort

```cpp
/**
* The main function that implements quick sort.
* @Parameters: array, starting index and ending index
*/
quickSort(arr[], low, high)
{
    if (low < high)
    {
        // pivot_index is partitioning index, arr[pivot_index] is now at correct place in sorted array
        pivot_index = partition(arr, low, high);

        quickSort(arr, low, pivot_index - 1);  // Before pivot_index
        quickSort(arr, pivot_index + 1, high); // After pivot_index
    }
}

/**
* The function selects the last element as pivot element, places that pivot element correctly in the array in such a way
* that all the elements to the left of the pivot are lesser than the pivot and
* all the elements to the right of pivot are greater than it.
* @Parameters: array, starting index and ending index
* @Returns: index of pivot element after placing it correctly in sorted array
*/
partition (arr[], low, high)
{
    // pivot - Element at right most position
    pivot = arr[high];  
    i = (low - 1);  // Index of smaller element
    for (j = low; j <= high-1; j++)
    {
        // If current element is smaller than the pivot, swap the element with pivot
        if (arr[j] < pivot)
        {
            i++;    // increment index of smaller element
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return (i + 1);
}
```

### Selection Sort

```cpp
SelectionSort(Arr[], arr_size):    
        FOR i from 1 to arr_size:    
            min_index = FindMinIndex(Arr, i, arr_size)    
        
            IF i != min_index:    
                swap(Arr[i], Arr[min_index])    
            END of IF    
        END of FOR
```

### Bubble Sort

```cpp
bubbleSort( Arr[], totat_elements)
   for i = 0 to total_elements - 1 do:
      swapped = false
      for j = 0 to total_elements - i - 2 do:
         /* compare the adjacent elements */   
         if Arr[j] > Arr[j+1] then
            /* swap them */
            swap(Arr[j], Arr[j+1])		 
            swapped = true
         end if
      end for
      /*if no number was swapped that means 
      array is sorted now, break the loop.*/
      if(not swapped) then
         break
      end if
   end for
end
```

# Recursion

For Time Analysis of recursive programs, it may be easier to find lower bounds and upper bounds first. For example, consider the time analysis of recursive Fibonacci code.

```cpp
T(n) = T(n - 1) + T(n - 2) + O(1)
" Lower bound "
T(n) > 2T(n - 2) + O(1) -> O(2^(n/2)) 
"""
Writing big-O notation here is not technically right. Instead we can write the following
If we know that T(n) = T(n - 1) + T(n - 2) + Θ(n), then we can write T(n) > Ω(n)
"""
" Upper bound "
T(n) < 2T(n - 1) + O(1) -> O(2^n)
```

Recursion builds up an implicit stack in the memory. To calculate the **maximum** space consumed, find the **depth** of the recursion tree.

# Hashing

Hashing is the process of converting a given key into another smaller value for O(1) retrieval time. This is done by taking the help of some function or algorithm which is called as **hash function** to map data to some encrypted or simplified representative value which is  termed as “hash code” or “hash”. This hash is then used as an index to  narrow down search criteria to get data quickly. 

**Hash Table** - A hash table is an array that stores pointers to data mapping to a given hashed key.

**Bucket** - A list containing all the values having the same hash value

**Hash Functions** - A hash function is a function or algorithm that is used to generate the encrypted or shortened value to any given key. Types of Hash Functions:

- Index Mapping method - The index of the element in the array is its hash.
- Division method - The hash is given by the remainder of the value with the table size. In this case, we need to take care of certain things. If the table length has the form $$r^p$$  then the hash values occupy only the `p` lowest-order bits of key.
- Mid square method - Square the value and take the middle digits. For ex, `h(88) -> 7(74)4 -> 74`.
- Digit folding method - The key is divided into separate parts and by using simple operations these separated parts are combined to produce a hash.

**Load Factor** - The load factor is simply a measure of how full (occupied) the hash table is, and is simply defined as: `α = number of occupied slots/total slots`

### Collisions 

When multiple elements fall into the same bucket, we say a collision has occured. Handling collisions:

- **Separate Chaining** - The idea is to maintain linked lists for buckets. Hashing performance can be  evaluated under the assumption that each key is equally likely and  uniformly hashed to any slot of hash table.

  ```
  Performance Analysis
  Load Factor = α = n/ table_size
  Time Complexity for search and delete - O(1 + α)
  Time Complexity for insert - O(1)
  ```

- **Open Addressing** - In this technique, we ensure that all records are stored in the hash table itself. The size of the  table must be greater than or equal to the total number of keys  available.

  - **Insert(Key)** -  When we try to insert a key to the bucket which is already occupied, we keep probing the hash table until an empty slot is found. Once we find the empty slot, we insert `key` into that slot. 
  - **Search(key):** While searching for `key` in the hash table, we keep probing until slot’s value doesn’t become equal to `key` or until an empty slot is found.
  - **Delete(key):** While performing delete operation, when we try to simply delete `key`, then the search operation for that key might fail. Hence, deleted key’s slots are marked as “**deleted**” so that we get the status of the key when searched.

  ```
  Performance Analysis
  * Load factor, α = n/table_size ( α < 1 )
  * Expected time taken to search/insert/delete operation < (1/(1 - α))
  * Hence, search/insert/delete operations take at max (1/(1 - α)) time
  ```

## Implementation Details

**C++** - Use `unordered_map` which are implemented via hashing. 

```cpp
/* Declaration */
unordered_map<int, int> A;
/* Inserting elements */
A.insert({key, value}); // O(1) on average
/* Finding elements */
if(A.find(k) == A.end()) return null;
else return A[k];	// Worst case O(n), Average O(1)
/* Printing size */
A.size() // O(1)
/* Erasing keys */
if(A.find(k) != A.end()) A.erase(A.find(k)); // or A.erase(k);
```

**Python** - Use Dictionaries.

## Dynamic Programming

- Make sure you write the base cases in recursion!
- You can use **static** variables in cpp for storing the memory from previous calls to the function. For example, the Fibonacci numbers code can be written as

```cpp
int climbStairs(int n) {
        if(n == 1) return 1;
        if(n == 0) return 1;
       static vector<int> dict(45, 0);
        if (dict[n - 1] == 0) 
            dict[n - 1] = climbStairs(n - 1) + climbStairs(n - 2);
        return dict[n - 1];
    }
```

Although, make sure the environment you are using supports static variables correctly.

- If you pass constant variables in recursion, pass them by reference rather than value to save memory and time!

# Greedy Algorithms

A greedy algorithm is a simple and efficient algorithmic approach  for solving any given problem by selecting the best available option at  that moment of time, without bothering about the future results.

In simple words, here, it is believed that the locally best choices made would be leading towards globally best results.In this approach, we never go back to reverse the decision of selection  made which is why this algorithm works in a top-bottom manner.

- This approach works well for **job scheduling** problems.

# Graphs

## Breadth First Search

**Shortest Path:** In an unweighted graph, the shortest path is the path with least number of edges. With BFS, we **always** reach a node from given source in shortest possible path. Example: Dijkstra’s Algorithm.

### Recursive BFS

```cpp
/**
* Pseudo code for recursive BFS
* @Parameters: Graph G represented as adjacency list, 
*  Queue q, boolean[] visited, key
* Initially q has s node in it.
*/

recursiveBFS(Graph graph, Queue q, boolean[] visited, int key){
    if (q.isEmpty())
        return "Not Found";

    // pop front node from queue and print it
    int v = q.poll();
    if(v==key) return "Found";

    // do for every neighbors of node v
    for ( Node u in graph.get(v))
    {
        if (!visited[u])
        {
            // mark it visited and push it into queue
            visited[u] = true;
            q.add(u);
        }
    }
    // recurse for other nodes
    recursiveBFS(graph, q, visited, key);
}

Queue q = new Queue();
q.add(s);
recursiveBFS(graph, q, visited, key);
```

### Iterative BFS

```cpp
/**
* Pseudo code for iterative BFS
* @Parameters: Graph G, source node s, boolean[] visited, key
*/

iterativeBFS(Graph graph, int s, boolean[] visited, int key){
    // create a queue neeeded for BFS
    Queue q = Queue();

    // mark source node as discovered
    visited[s] = true;

    // push source node into the queue
    q.add(s);

    // while queue isnt empty
    while (!q.isEmpty())
    {
        // pop front node from queue and print it
        v = q.poll();
        if(v==key) return "Found";

        // for every neighboring node of v
        for (int u : graph.get(v)) {
            if (!visited[u]) {
                // mark it visited and enqueue to queue
                visited[u] = true;
                q.add(u);
            }
        }
    }
    //If key hasnt been found
    return "Not Found";
}
```

**Dijkstra's in an unweighted graph is BFS**.

## Depth First Search

The code is much simpler in this case

### Recursive DFS

```cpp
/**
* Pseudo code for recursive DFS
* @Parameters: adjacent list G, source node, 
* visited array, key (node to be searched)
*/

DFS(adjacent[][], source, visited[], key) {
   if(source == key) return true //We found the key
   visited[source] = True
   
   FOR node in adjacent[source]:
       IF visited[node] == False:
          DFS(adjacent, node, visited)
       END IF
   END FOR
   return false    // If it reaches here, then all nodes have been explored 
                  //and we still havent found the key.
}
```

### Iterative DFS

Just replace `queue` with `stack` in iterative BFS.

## Dijkstra's Algorithm

It is used to find the **shortest path** between a node/vertex (source node) to any (or every) other nodes/vertices  (destination nodes) in a graph. A graph is basically an interconnection  of nodes connected by edges. This algorithm is sometimes referred to as **Single Source Shortest Path Algorithm** due to its nature of implementation.

```cpp
Dijkstra_Algorithm(source, G):
    """
    parameters: source node--> source, graph--> G
    return: List of cost from source to all other nodes--> cost
    """
    unvisited_list = []			// List of unvisited verticesvertices
    cost = []
    cost[source] = 0              // Distance (cost) from source to source will be 0
    for each vertex v in G:       // Assign cost as INFINITY to all vertices
       if v ≠ source
             cost[v] = INFINITY
             add v to unvisited_list    // All nodes pushed to unvisited_list initially

    while unvisited_list is not empty:        	     // Main loop
       v = vertex in unvisited_list with min cost[v]      // v is the source node for first iteration
       remove v from unvisited_list		            // Marking node as visited 

       for each neighbor u of v:			// Assign shorter path cost to neigbour u
          cost_value = Min( cost[u], cost[v] + edge_cost(v, u)]
          cost[u] = cost_value            		// Update cost of vertex u 

    return cost
```

# Miscellaneous

- Each element in the array appears twice except for one element which appears only once. Use **xor**.
- Rotate a matrix by sequential reflection operations.
- 32 but integers range from `-2147483648` to `2147483647`. The small difference may give a wrong answer in your code.
- Make sure you initialise **flag** variables.
- When you declare pointers, put a star `*` in front of every variable. That is, use `int *p, *q` and not `int* p, q`.
- Sometimes, arithmetic operations may cause the result to cross the datatype boundary. Take care of these. For example, instead of `(l + r)/2`, use `(l/2 + r/2 + (l%2+ r%2)/2`.
- Missing number from range - Use `xor` instead of `sum`