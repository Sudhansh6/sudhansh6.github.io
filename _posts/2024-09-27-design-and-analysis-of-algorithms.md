---
layout: post
title: Design and Analysis of Algorithms
categories: [Notes]
description: A collection of ideas for design algorithms and analyzing them.
---

# Greedy Algorithms

## Minimum Spanning Tree

Consider a graph $$G$$ describe by $$V$$ and $$E$$ (positive weights). A **spanning tree** of a graph is defined as an edge set $$T \subset E$$ such that $$(V, T)$$ is a tree. A minimum spanning tree is such that $$\sum_{l \in T} l_e$$ is minimized.

For a graph with $$n$$ vertices, there are $$n^{n - 2}$$ spanning trees for a complete graph (**Cayley’s formula**).

How do we calculate the number of spanning trees for a general graph? **Kirchoff’s theorem** states the following -

- Let $$M$$ be the adjacency matrix of $$G$$
- Let $$L - M$$ except $$L_{i, i} = -deg(i)$$ - This is generally called as **Graph Laplacian**
- Then, #spanning trees is the determinant of any $$m-1$$ square sub-matrix (obtained by removing $$i$$th row and column) of $$L$$.

Notice how any sub-matrix yields the same value!

## Greedy Idea 1: Kruskal’s algorithm

- Sort all the edges with their weights
- Pick edges as long as they don’t form a cycle

Does this work? If it does, how do we prove it?

Firstly, why is it a greedy idea? At each point of the algorithm, we select the current greedy edge (a local minimum) to obtain the minimum spanning tree (a global optimum).

- **The cut property -** Let $$S \subseteq V$$ such that $$S$$ and $$V - S$$ are non-empty. If $$e$$ is an edge across $$S$$ and $$V - S$$ with the minimum cost, then there always exists a minimum spanning tree with $$e$$.
  
  **Proof.** Exchange argument. If there an MST with $$e’$$ across $$S$$ and $$V - S$$, then replace $$e$$ with $$e’$$ to obtain another MST.
  
  > Shouldn’t this argument be more delicate? Why is there a single edge from S to V - S?
  
  Essentially, the exchange argument argues replacing a part of the solution improves the solution but does not worsen it.

- The time complexity of the algorithm comes out to be $$O(m \log m + m \alpha(n))$$. The second term in the expression comes from union-find data structures.

- **Correctness of the algorithm** - We shall prove this via induction.
  
  - Induction hypothesis - The edges selected in the $$i$$th round of Kruskal’s algorithm can form an MST along with a subset of edges from the remaining edges.
  - Base statement - True for $$i = 0$$
  - Induction step - Cut property

- **Union-find data structure** - A data structure that supports
  
  - Merging elements of two sets into a single set - `union(x, y)`
  - Checking whether two elements are in the same set - `find(x)`
  
  efficiently. The amortized time complexity for these operations is $$\alpha(n)$$ where $$\alpha(n) \leq 4$$ for $$n$$ of the order $$2^{2^{2^{2^{16}}}}$$. As a result, $$\alpha(n)$$ can be regarded as a constant for practical purposes.
  
  In our case, the elements are edges and sets represent connected components.

## Greedy Idea 2: Prim’s Algorithm

Start with any node and expand with the smallest edge connecting to the remaining set of edges. Note that this is different from Kruskal’s algorithm where we sort all the edges and create individual connected components that eventually merge together.

The proof for Prim’s algorithm is very similar to that of Kruskal’s. The time complexity is $$O(n^2 + m)$$ similar to Djikstra’s algorithm without a data structure. We can maintain a **priority queue** to maintain all edges that come from $$S$$ to reduce the time-complexity to $$O((n + m) \log m)$$ (without decrease-key). With decrease key and a binary heap, the complexity becomes $$O((n + m) \log n)$$. Furthermore, with decrease key and a Fibonacci heap, the complexity reduces to $$O((n\log n + m)$$.

## Other algorithms

- **Reverse deletion** - For every cycle in the original graph and the edge $$e$$ with the maximum cost, there always exists an MST without $$e$$. Until there are no cycles in the graph, find a cycle and delete the edge with a maximum cost. Note that this algorithm has a higher time complexity since we try and find a cycle for each iteration of the algorithm. How do we implement this?

## Union-Find data structure

The idea is to maintain trees with pointers to merge and find elements. The main complication comes while merging the individual sets.

- Merging by size (consuming smaller ones by larger sets) - The complexity of merging sets of size $$n$$, $$m$$ times takes $$O(m \log n)$$

- To optimize this further, we merge by rank (generalizing the previous approach where rank was simply the size of the set). We add another trick to reduce the amortized time complexity.
  
  - Path compression - When `find(x)` is called, attach the found elements along the path directly to the root to reduce the path size.
  
  The time complexity then becomes $$O(m \log^* n)$$ where $$\log^* n$$ is the minimum $$k$$ such that $$\log^{(k)} n \leq 1$$.

# More Greedy Problems related to MST

### $$k$$-clustering

A **maximum spacing** for $$k$$-clustering of $$G =(V, E)$$ is defined as

- An edge set $$T \subset E$$ such that $$(V, T)$$ has exactly $$k$$ connected components
- The **spacing** is then $$\min d(u, v)$$ for $$u, v$$ in different connected components
- The goal is to maximize the spacing

This problem can be solved again with Kruskal’s algotihm to find $$k$$-connected components - perform the `union` operation for $$n - k$$ times. Why is this correct? WE can show this using a contradiction.

- Consider two nodes that lie in the same connected component in the result obtained by Kruskal’s (with spacing $$d’$$). Let them be in different connected components in the optimal solution (with spacing $$d$$). Then,

### Second MST

A second MST is essentially the spanning tree with the *second* lowest edge summation cost. How do we find this tree?

- Find an MST with weight $$w$$
- For every edge $$e$$ not in the MST, if adding $$e$$ yields a cycle in the graph; then remove the largest edge $$e’$$ other than $$e$$ in the cycle to obtain the second MST
- The cost of the tree would be $$w + l_e - l_{e’}$$

The time complexity of this algorithm is $$\mathcal O(T_{MST} + mn)$$ and can be improved to $$\mathcal O(T_{MST} + m \log n)$$ with better data-structures and divide-and-conquer.

**Lemma.** The second MST only differs by one edge from the MST. Multiple MSTs? **Proof.** Can be shown using contradiction. The idea is that one can move from one spanning tree to another with local changes in the trees. The argument is that you can replace the edges in the second MST with the edges in the MST to obtain a tree with a lower cost. This process can be repeated until there is only one edge that is different from an MST and replacing that would cause the tree to become the MST.

## More Greedy Problems

## Needle in Haystack

Given two strings $$s, t$$, decide whether there is a subsequence (need not be contiguous) in $$s$$ that matches with $$t$$. A naive greedy algorithm is depicted as follows -

```python
i, j = 0, 0
while True:
    if j == len(t):
        break 
    if s[i] == t[j]:
        j += 1 # s[i] is matched with t[j]
    else:
        i += 1
```

On first glance, it looks as if this is a very intuitive algorithm. However, there are more intricate details and the proof makes these clearer. The proof relies on the Exchange argument. If there exists a subsequence $$i_1 i_2 \dots i_m$$ in $$s$$ matching $$t$$ ($$\vert t \vert = m$$). If $$i^*_1 < i_1$$ is the first index that $$s[i_1] = t[1]$$, then $$i^*_1i_2\dots i_m$$ also matches $$t$$. This way we can find a set of indices $$i^*_1i^*_2 \dots i^*_m$$ through the greedy algorithm that gives the correct answer.

In general, greedy algorithms can be proven in two general ways

- Consider any iteration of the algorithm and show that the decision made by the greedy algorithm is the best and conclude using induction
- Exchange argument: Pick an optimal solution and gradually change it to the solution produced by the greedy algorithm showing that the optimality is not affected.

## Matroids

A finite matroid $$M$$ consists of $$(E, I)$$ where

- $$E$$ is a finite set (called the ground set). For example, $$E$$ is the set of all edges in the graph $$G = (V, E)$$
- $$I$$ is a collection of subsets of $$E$$ (called the independent set). For example, $$I$$ consists all subsets of $$S$$ of $$E$$ such that all the edges in $$s \in S$$ form a forest.

$$(E, I)$$ should satisfy the following properties -

- Null set should be in $$I$$ - $$\phi \in I$$
- if $$A \subset B$$ and $$B \in I$$ then $$A \in I$$
- If $$A, B \in I$$, $$\vert A\vert > \vert B \vert$$ then $$\exists e \in A - B$$, such that $$B \cup \{e\} \in I$$

Isn’t 2 inclusive of 1 and 3?

How does this data structure help us? Suppose we have a graph $$G = (V, E)$$ with weights $$c_e \geq 0$$. Then, design an algorithm to find an independent set $$S$$ that maximizes $$\sum_{e \in S} c_e$$. Consider the following algorithm -

- Sort $$e$$ in decreasing order of weights
- Let $$S = \phi$$. Add $$e$$ to $$S$$ if $$e$$ does not add cycles in $$S$$

This algorithm is very similar to the reverse deletion algorithm and has a time complexity $$\mathcal O(\vert E \vert \log \vert E \vert + T_{check \text{ IS}})$$.

**Lemma.** Let $$e \in E$$ have the maximum cost $$c_e$$m then there always exists an IS $$A$$ with maximum weight containing $$e$$.

The proof is very similar to what we have shown with MSTs. This example can be applied to MSTs, and it demonstrates how Matroids can be useful for greedy algorithms.

## Task Scheduling

Given $$n$$ jobs each with $$t_i$$ time to finish and deadlines $$d_i$$. Consider that there is a single resource solving tasks sequentially from time $$0$$, and a job has to completely finished before moving onto the next one.

Suppose in a scheduling algorithm, job $$i$$ finishes at time $$f_i$$, then the lateness is defined as $$l_i = \max\{0, f_i - d_i\}$$. The goal is find an algorithm that minimizes the maximum lateness $$minimize \max_i l_i$$.

Let us consider a simple case. Suppose there are two jobs with $$d_i \leq d_2$$. Note that any scheduling algorithm should not have any idle time between jobs. Why so? If there is idle time, you can always do a job earlier to reduce the lateness. Furthermore, a scheduling algorithm should not have an *inversion.* That is, if job 1 has deadline earlier than job 2, then it is always optimal to perform job 1 before job 2. This claim can be easily proved using the exchange argument.

### Algorithm

Sort all jobs according to the increasing order of these deadlines $$d_i$$, then complete each job without any idle time.

**Proof.** Generalize the previous two observations to $$n$$ jobs.

## Huffman Codes

How do we encode an alphabet in binaries to have no ambiguities.

### Prefix codes

A prefix code for an alphabet $$T$$ is a function $$f:T \to \{0, 1\}^*$$, such that for distinct $$x, y \in T$$, $$f(x)$$ is not a prefix of $$f(y)$$.

It can be shown that a prefix code gives unique decoding.

How do we design an encoding that is most efficient? Let us define efficiency. For every letter $$x$$ in $$T$$, let its frequency be $$p_x (\sum_{x \in T} p_x = 1)$$. Let $$f$$ be a prefix code and for every letter $$x \in T$$, let $$\vert f(x)\vert$$ is the number of bits. The goal is to find a prefix code $$f$$ that minimizes the expected number of bits when encoding $$R$$ under the frequency $$\{p_x\}$$.

$$
\text{minimize } \sum_{x \in T} p_x \cdot |f(x)|

$$

It is beneficial to represent prefix codes as a binary tree. Each node has two children: 0 and 1. The paths from the root to other nodes in the tree represent the binary encodings.

- For prefix codes, no node of a symbol is an ancestor of node of another symbol (from the alphabet).
- Another observation is that any optimal prefix code is a full tree (every inner node has two children) - if anode has a single chide, the parent node can itself be used for the symbol deleting the leaf node making the encoding more efficient.
- There is an optimal tree (prefix code) such that two lower frequent letters are siblings, and are as deep as possible in the tree. This claim can be proved easily with the exchange argument.

With these observations, consider the following algorithm

- Initialize each letter $$x$$ as a node and label it with $$p_x$$

- Put all nodes into a min-heap (according to the frequency)

- While min-heap has atleast two elements
  
  - Pop out the two smallest elements $$u, v$$ (corresponds to two trees)
  
  - Combine them to a single tree
  
  - Push it into the heap, label with $$p_u + p_v$$

This is the Huffman's coding algorithm which has a time complexity of $$n \log n$$.

## Shannon's source coding theorem

Let $$T$$ be an alphabet with frequency $$\{p_x\}$$. The entropy of the alphabet is defined as 

$$
H := \sum_{x \in T} p_x \cdot \log \frac{1}{p_x}
$$

The Shannon's source coding theorem then states that you cannot send a letter from $$T$$ with frequenct $$\{p_x\}$$, with expected bits less than $$H$$. Huffmman's encoding gives a solution with expected bits at most $$H + 1$$.

**Important point**. One can suggest to increase the alphabet size with dummy symbols to virtually reduce the value of $$H$$ significantly. However, this introduces complexity for encoding algorithms. Therefore, there is a tradeoff with space occupied by encoding and the time for encoding. 

> Even with augmented alphabet, the size of the encoding does not change for the original symbols in the alphabet?

# Binary Search X Greedy Algorithms

The basic binary search takes advantage of the monotone structure in arrays to identify elements with certain properties. Any binary search problem can be converted to the following simpler version: For an array $$B$$ that has binary elements with all zeros occurring before all ones, find the index of the first occuring $$1$$.

The binary search algorithm can be simply proved using induction. 

Let us consider an example - Ternary search. Given an array $$A[1\dots n]$$ that is first strictly increasing and then strictly decreasing, dind the largest element. The array $$B[1\dots n - 1]$$ is constructed as 

- $$B[i] = 1 \iff A[i + 1] > A[i]$$

- $$B[i] = 0 \iff A[i + 1] < A[i]$$

## Split-array largest sum

## Minimum fractional ST

Given an undirected graph $$G = (V, E)$$ and each edge has two costs $$a_e, b_e$$ both of which are positive, find a spanning tree $$T$$ that minimizes

$$
\frac{\sum_{e \in T} a_e}{\sum_{e \in T} b_e}
$$

How is this related to binary search? Firstly, we will convert this problem to a decisional version - Given an undirected graph $$G = (V, E)$$ and a real number $$U$$, decide whether there exists a spanning tree $$T$$ such that $$\frac{\sum_{e \in T} a_e}{\sum_{e \in T} b_e} \leq U$$.

This is equivalent to find a spanning tree such that $$\sum_{e \in T} a_e - U b_e \leq 0$$. Construct a new graph with the weights $$a_e - Ub_e$$. The reduction is easy to follow.

How do we find the monotone structure for binary search? If the decision problem $$(G, U)$$ is satisfiable, then $$(G, U')$$ is also satisfiable for any $$U' > U$$. Conceptually, assume a function $$B$$ (with continuous index) such that $$B[0, S] \to \{0, 1\}$$ where $$S$$ is an upper bound. $$B(U) = 1$$ iuf and only if $$(G, U)$$ is satisifiable, and $$B$$ is monotone. 

# Divide and Conquer

## Master Theorem

Consider an algorithm that has the following relationship for running time complexity - 

$$
T(n) = 2T \left(\frac{n}{2}\right) + c n \log^k n \quad (k \geq 0)
$$

then $$T(n) = \mathcal O(n \log^{k + 1} n)$$.

## Closest Point

## Fast Multiplication

Suppose we have two integers in binary $$a = \sum_{0 \leq 1 \leq n} a_i \cdot 2^i, b = \sum_{0 \leq 1 \leq n} b_i \cdot 2^i$$. The goal is to compute $$c = ab = \sum_{0 \leq j < 2n} c_j \cdot 2^j$$ where $$c_j = \sum_{0 \leq k \leq j} a_k b_{j - k}$$. The naïve brute force approach takes $$\mathcal O(n^2)$$ to compute the answer.

This question is related to matrix multiplication as well. The naïve algorithm takes $$\mathcal O(n^3)$$. 

### Algorithm 1

We segment $$a, b$$ as follows - 

- $$a = A_1 \cdot 2^{\frac{n}{2}} + A_0$$ where $$A_0 = \sum_{0 \leq 1 < n/2} a_i \cdot 2^i$$ and $$A_1 = \sum_{n/2 \leq i < n} a_i \cdot 2^{i - n/2}$$

- $$b = B_1 \cdot 2^{\frac{n}{2}} + B_0$$ similarly.

Then, $$ab = (A_1 \cdot 2^{\frac{n}{2}} + A_0)(B_1 \cdot 2^{\frac{n}{2}} + B_0)$$. The strategy then is to do a divide and conquer on these halves to get the final answer.

$$
ab = A_1 B_1 2^n + (A_0 B_1 + A_1 B_0)2^{n/2} + A_0B_0
$$

The time complexity is then $$T(n) = 4T(\frac{n}{2}) + \mathcal O(n)$$. This is essentially $$\mathcal O(n^2)$$ that does not give any improvement.

This can be optimized further -

$$
ab = A_1 B_1 2^n + ((A_0 + A_1)(B_0 + B_1) - A_0B_0 - A_1 B_1)2^{n/2} + A_0B_0
$$

The number of multiplications reduced to 3 - $$T(n) = 3T(\frac{n}{2}) + \mathcal O(n)$$. Deriving the final expression, $$T(n) = cn + cn\frac{3}{2} + \dots + cn\left(\frac{3}{2}\right)^{\log n} = \mathcal(3^{\log n})$$.

This algorithm can be extended to matrix multiplications as well. 

$$
C = AB = \begin{bmatrix} A_{00}B_{00} + A_{01}B_{10} & A_{00}B_{01}  + A_{01} B_{11} \\A_{10}B_{00} + A_{11}B_{10} & A_{10}B_{01} + A_{11}B_{11}\end{bmatrix}
$$

The naïve algorithm shown above is still $$O(n^3)$$. Strassen's algorithm reduces the number of multiplications to $$7$$ providing an improvement over the $$\mathcal O(n^3)$$ algorithm giving $$\approx \mathcal O(n^{2.81})$$.

The current state of the art algorithm for matrix multiplication achieves $$\mathcal O(n^{2.371552})$$. We do not know if there is an algorithm that achieves $$\mathcal O (n^{2 + o(1)})$$.

### Algorithm 2

Multiplication can be seen as a special case of convolution and we can use **Fast Fourier Transform (FFT)** to perform this in $$\mathcal O(n \log n)$$. The details will be elaborated in the next section.

## Convolution

Consider two vectors of the following form -

- $$a = (a_{n - 1}, a_{n - 2}, \dots, a_2, a_1, a_0)$$

- $$b = (b_{n - 1}, b_{n - 2}, \dots, b_2, b_1, b_0)$$

The convolution operation $$\star$$ is defined as

$$
c = a\star b = (c_{n - 1}, \dots, c_0) \quad \text{ where } c_j = \sum_{0 \leq k < n} a_j b_{(j - k)\mod n}
$$

Convolution is a generalization of integer multiplication (padding + convolution = multiplication). Also, convolution is a central operation in signal processing - used for blurring images and also to learn features from spatial data.

The naïve algorithm can be done in $$\mathcal O(n^2)$$ time. We can perform convolution using $$\mathcal O(n\log n )$$ using **Fourier Transform**. 

# Fourier Transform

Consider the $$n$$ dimensional vector $$a = (a_{n - 1}, a_{n - 2}, \dots, a_2, a_1, a_0)$$ and $$b = (b_{n - 1}, b_{n - 2}, \dots, b_2, b_1, b_0)$$. Let $$\{e_i\}_i$$ form a unit basis of $$\mathbb R^n$$ such that $$a = \sum_{0 \leq i < n} a_i e_i, b = \sum_{0 \leq i < n} b_i e_i$$.

Consider another basis $$\hat e_i(j) = \omega_n^{ij}$$ where $$\omega_n = e^{\frac{1\pi \bf{i}}{n}}$$ is the $$n$$-th root of unity. Therefore, $$\hat e_i = \frac{1}{\sqrt{n}} \omega_n^{(n - 1)i}, \dots, \omega_n^{2i}, \omega_n^{i}, 1)$$.

It is easy to check that this is a valid basis. So, again, $$a, b$$ can be uniquely represented as 

- $$a = \sum_{0 \leq i < n} \hat a_i \hat e_i$$, $$\hat a_i = \langle a_i, \hat e_i\rangle = \frac{1}{\sqrt{n}} \sum_j a_j \omega_n^{-ij}$$

- $$b = \sum_{0 \leq i < n} \hat b_i \hat e_i$$

A **Fourier transform** is then defined as - Given $$\{a_i\}_{i \in [n]}$$, compute $$F(a) = \{\hat{a_i}\}_{i \in [n]}$$.

The **inverse problem** is to find $$F^{-1} (\hat a) = \{a_i \}_{i \in [n]}$$. It essentially is a change of basis between $$\{e_i\} \iff \{\hat e_i\}$$.

## Convolution Theorem

Let $$a, b$$ be two vectors in $$\mathbb R^n$$; then, 

$$
a \star b = F^{-1} (F(a) \cdot F(b))
$$

With this claim, convolution can be f=done in $$\mathcal O(2T_{FT} + T_{IFT} + n)$$.

# Dynamic Programming

## Longest path on a DAG

Given a DAF with $$n$$ vertices, $$m$$ edges, every edge $$e$$ has a weight $$l_e$$, compute the longest path on the DAG. The length of a path is defined as the weight sum over all edges in the path.

Consider the following algorithm

```pseudocode
DFS(u):
    if marked[u] = true:
        return DP[u]
    cost <- 0
    for all v that (v, u) in E:
        cost <- max(cost, DFS(v) + l_{v, u})
    marked[u] <- true
    DP[u] <- cost
    return cost
```

The time complexity of the algorithm is $$\mathcal O(n + m)$$. The key point to notice is that instead of recomputing the cost of each path, we have essentially stored the costs in the array `DP` to reduce the redundant calculations. This step is known as **memoization**.

## Knapsack Problem

Consider an integer $$U$$ representing total capacity and a list of integers $$\{v_i, c_i\}$$ that represents the volume and cost of each item respectively. The goal is to pick items such that their total volume is at most $$U$$ and their value is maximized. 

**Idea 1**. Sort everything by $$v_i/c_i$$ and pick the items until value if $$U$$. It is easy to see that this greedy algorithm will not work.

### A Backtracking algorithm

Consider an iterative algorithm that at step $$i$$ has $$C$$ volume left and is considering whether to pick or skip the $$i$$-th item. Considering these two possibilities, we can implement a brute force algorithm with memoization for dynamic programming.

We set a 2D matrix of size $$(U, n)$$ where each row $$i$$ represents the set of items that need to be picked to maximize the cost within volume $$U$$. The time complexity of this algorithm would be $$\mathcal O(2^n)$$.

The algorithm is as follows -

```pseudocodedfs(C,
   dfs(C, i):
       if i = 0: return 0
       Cost <- dfs(C, i - 1)
       if C >= c_i:
           Cost <- max(Cost, dfs(C - c_i, i - 1) + v_i)
       return Cost
```

### Alternative view

We can treat every possible $$(C, i)$$ as a vertex in a graph. Every vertex has at most two outcoming edges - $$(C, i) \to (C - c_i, i - 1)$$ with cost $$v_i$$ and $$(C, i) \to (C, i - 1)$$ with cost $$0$$. This constructed graph is a DAG and we essentially reduced Knapsack problem to longest path on a DAG.

Based on the algorithm we have seen earlier, we modify the algorithm to include memoization

```psuedocode
   dfs(C, i):
       if marked[C][i] = true: return DP[C][i] // Modification
       if i = 0: return 0
       Cost <- dfs(C, i - 1)
       if C >= c_i:
           Cost <- max(Cost, dfs(C - c_i, i - 1) + v_i)
       marked[C][i] <- true // Modification
       DP[C][i] <- cost // Modification
       return Cost
```

The modified algorithm now has the time complexity $$\mathcal O(Un)$$ since there are $$Un$$ vertices in total with atmost 2 edges each.

## General observation

Dynamic Programming problems can be typically thought og as a decision-making processes. These decision problems can be converted to graphs where the states are vertices on a graph and the transitions are edges on a graph. Typically, the problem have a DP solution if the graph is a DAG and the number of states is not too large.

The algorithm shown above can then be used as a general procedure to solve the problems. Sometimes, it is beneficial to implement the algorithms with a loop rather than recursion.

## Knapsack with unlimited items

The algorithm remains pretty much the same except that teh recrusion call has `dfs(C - c_i, i)` instead of `dfs(C - c_i, i - 1)`. 

## Knapsack with limited items

We can consider another variant where item $$i$$ can be used at most $$k_i$$ times. Then, a similar algorithm would have the time complexity $$\mathcal (U \sum_i k_i)$$. 

A better solution treats the $$i$$th item as $$\lceil \log k_i\rceil$$ items. For example, if $$k_i = 8$$, then divide the item as $$(c_i, v_i), (2c_i, 2v_i), (4c_i, 4v_i), (c_i, v_i)$$. Then the time complexity would be reduced to $$\mathcal O(U \sum_i \log k_i)$$. 

However, it can be improved to $$\mathcal O(Un)$$ using a **monotonic queue**.

## 2D Knapsack

In this variant, each item has value $$v_i$$, volume integer $$c_i > 0$$ and a weight integer $$w_i > 0$$. The goal is to find a subset of items that has the total volume at most $$U$$, total weight at most $$W$$ and the total value is maximized. The dynamic programming algorithm has a runtime of $$\mathcal O(WUn)$$.

In the loop variant of the algorithm, it is better to iterate over the items first rather than the weights. Why is that? Furthermore, it is better to iterate decreasing the costs, because
