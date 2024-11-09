---

layout: post
title: Tabletop Manipulation Algorithms
categories: [Research]
excerpt: Various methods for optimal mobile tabletop rearrangement - rearrange objects on the table with the least cost.
toc: 
sidebar: true

---

## Problem

Given a table top with various objects, their initial positions and final goal positions, we want to find the algorithm to rearrange the objects with the **least number of actions** and **low buffer space**.

### Buffers

If one object is obstructing the goal position of the other, we would want to use *buffer space* to free-up the goal space. In a brute force manner, we can place everything on the side and put objects in their goals states. We want to optimize the number of actions, and doing this doesn't do well in that scenario.

The problem in the general case reduces to traveling salesman problem or the vertex cover problem, which are both NP-hard. We want to find a good approximation algorithm to get the least amount of actions.

We also want real-time execution time because we do not want the algorithm to run for a long time.

### Variations

1. Mobile and mobile base

2. Disk objects and different shape objects

3. stacking vs not stacking objects

4. External buffer or not

5. Single vs multiple tables

6. Overlaps vs non-overlapping objects

### Search Problem

The problem can be converted to a search problem where the search space is a tree representing all the possibilities of movements of objects (to goal positions) possible with the current configuration. The actions would be of the form "move object 'i' to buffer", "move object 'i' to goal position", etc. At each state, we have at most $$2n$$ actions (if there are $$n$$ objects on the table) - moving each object to buffer or goal.

Obviously, this is a very high-dimensional space, and rudimentary search algorithms would not fare well if used directly.

Let us now see some algorithms that try to tackle this.

## TRLB

[Fast High-Quality Tabletop Rearrangement in Bounded Workspace](https://arxiv.org/abs/2110.12325) does the following -

1. Calculate a primitive plan by assuming there is always a feasible buffer space on the table (assume you have a second table to place objects)

2. Try executing this plan, and assign buffer as we go along the path. 

3. If we fail to assign a buffer, we add a node to mark this search path.

4. We repeat the procedure by finding a primitive plan from this stage until we find a feasible path.

The goal of this algorithm is to quickly calculate the solutions but it has a suboptimal traveling cost (example, robot mobile base needs to move a lot). Note that this is a non-deterministic algorithm, since we calculate random primitive plans.

## ORLA*

Aims to calculate the optimal path without considering the time as a heuristic. It essentially is $$A^*$$ adapted to the table-top rearrangement problem - $$f(n) = g(n) + h(n)$$ where $$g(n)$$ is the travel cost from start to current node and $$h(n)$$  expected travel cost from current node to goal.

It results in an optimal plan but has a very long execution time. Another point to note is that ORLA* considers a mobile base which not many papers have considered previously.

## Our Research

We aim to build an algorithm that gives the optimal solution and also executes fast. We assume mobile base manipulation robot with arbitrary shape objects and no external buffer.

### Approach 1

Perform search in TRLB using MCTS to find the most optimal search plan. Basically, execute TRLB for a fixed time to get multiple feasible paths. TRLB stops as soon as it finds a feasible path, but we execute it until we get a fixed number of possible paths.

### BIT*

We initially find a suboptimal path using TRLB* - this is fast. 

## Future Directions

1. Extend the algorithms for multi-agent scenarios where the problem becomes much harder.

2. Learn conflict detection in TRLB or the modified algorithm to do better backtracking - one of the key ideas for combinatorial search algorithms. This can be done via SAT solving - learn conflicts as new constraints. This is particularly important when the number of objects on the table is high with a high density.
