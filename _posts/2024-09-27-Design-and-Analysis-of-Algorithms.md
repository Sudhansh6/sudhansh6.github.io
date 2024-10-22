---
layout: post
title: Design and Analysis of Algorithms
categories: [Notes]
description: A collection of ideas for design algorithms and analyzing them.
---

# Minimum Spanning Tree

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

```jsx
i, j = 0, 0
while True:
    if j == len(t):
        break 
    if s[i] == t[j]:
        j += 1 # s[i] is matched with t[j]
    else:
        i += 1
```

On first glance, it looks as if this is a very intuitive algorithm. However, there are more intricate details and the proof makes these clearer. The proof relies on the Exchange argument. If there exists a subsequence $$i_1 i_2 \dots i_m$$ in $$s$$ matching $$t$$ ($$|t| = m$$). If $$i^*_1 < i_1$$ is the first index that $$s[i_1] = t[1]$$, then $$i^*_1i_2\dots i_m$$ also matches $$t$$. This way we can find a set of indices $$i^*_1i^*_2 \dots i^*_m$$ through the greedy algorithm that gives the correct answer.

In general, greedy algorithms can be proven in two general ways

- Consider any iteration of the algorithm and show that the decision made by the greedy algorithm is the best and conclude using induction
- Exchange argument: Pick an optimal solution and gradually change it to the solution produced by the greedy algorithm showing that the optimality is not affected.

## Matroids

A finite matroid $$M$$ consists of $$(E, I)$$ where

- $$E$$ is a finite set (called the ground set). For example, $$E$$ is the set of all edges in the graph $$G = (V, E)$$
- $$I$$ is a collection of subsets of $$E$$ (called the independent set). For example, $$I$$ consists all subsets of $$S$$ of $$E$$ such that all the edges in $$s \in S$$ form a forest.

$$(E, I)$$ should satisfy the following properties -

- $$\phi \in I$$
- if $$A \subset B$$ and $$B \in I$$ then $$A \in I$$
- If $$A, B \in I$$, $$|A| > |B|$$ then $$\exists e \in A - B$$, such that $$B \cup \{e\} \in I$$

Isn’t 2 inclusive of 1 and 3?

How does this data structure help us? Suppose we have a graph $$G = (V, E)$$ with weights $$c_e \geq 0$$. Then, design an algorithm to find an independent set $$S$$ that maximizes $$\sum_{e \in S} c_e$$. Consider the following algorithm -

- Sort $$e$$ in decreasing order of weights
- Let $$S = \phi$$. Add $$e$$ to $$S$$ if $$e$$ does not add cycles in $$S$$

This algorithm is very similar to the reverse deletion algorithm and has a time complexity $$\mathcal O(|E|\log |E| + T_{check \text{ IS}})$$.

**Lemma.** Let $$e \in E$$ have the maximum cost $$c_e$$m then there always exists an IS $$A$$ with maximum weight containing $$e$$.

The proof is very similar to what we have shown with MSTs. This example can be applied to MSTs, and it demonstrates how Matroids can be useful for greedy algorithms.

# Task Scheduling

Given $$n$$ jobs each with $$t_i$$ time to finish and deadlines $$d_i$$. Consider that there is a single resource solving tasks sequentially from time $$0$$, and a job has to completely finished before moving onto the next one.

Suppose in a scheduling algorithm, job $$i$$ finishes at time $$f_i$$, then the lateness is defined as $$l_i = \max\{0, f_i - d_i\}$$. The goal is find an algorithm that minimizes the maximum lateness $$minimize \max_i l_i$$.

Let us consider a simple case. Suppose there are two jobs with $$d_i \leq d_2$$. Note that any scheduling algorithm should not have any idle time between jobs. Why so? If there is idle time, you can always do a job earlier to reduce the lateness. Furthermore, a scheduling algorithm should not have an *inversion.* That is, if job 1 has deadline earlier than job 2, then it is always optimal to perform job 1 before job 2. This claim can be easily proved using the exchange argument.

### Algorithm

Sort all jobs according to the increasing order of these deadlines $$d_i$$, then complete each job without any idle time.

**Proof.** Generalize the previous two observations to $$n$$ jobs.

# Huffman Codes

How do we encode an alphabet in binaries to have no ambiguities.

### Prefix codes

A prefix code for an alphabet $$T$$ is a function $$f:T \to \{0, 1\}^*$$, such that for distinct $$x, y \in T$$, $$f(x)$$ is not a prefix of $$f(y)$$.

It can be shown that a prefix code gives unique decoding.

How do we design an encoding that is most efficient? Let us define efficiency. For every letter $$x$$ in $$T$$, let its frequency be $$p_x (\sum_{x \in T} p_x = 1)$$. Let $$f$$ be a prefix code and for every letter $$x \in T$$, let $$|f(x)|$$ is the number of bits. The goal is to find a prefix code $$f$$ that minimizes the expected number of bits when encoding $$R$$ under the frequency $$\{p_x\}$$.

$$
\text{minimize } \sum_{x \in T} p_x \cdot |f(x)|

$$

It is beneficial to represent prefix codes as a binary tree. Each node has two children: 0 and 1. The paths from the root to other nodes in the tree represent the binary encodings.

- For prefix codes, no node of a symbol is an ancestor of node of another symbol (from the alphabet).
- Another observation is that any optimal prefix code is a full tree (every inner node has two children) - if anode has a single chide, the parent node can itself be used for the symbol deleting the leaf node making the encoding more efficient.
- There is an optimal tree (prefix code) such that two lower frequent letters are siblings, and are as deep as possible in the tree. This claim can be proved easily with the exchange argument.
