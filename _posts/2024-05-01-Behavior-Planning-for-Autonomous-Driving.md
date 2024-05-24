---
layout: post
title: Scalable Behavior Planning for Autonomous Driving
categories: [Research]
description: Discussion on algorithms for predicting behavior patters in dense urban scenes.

---

A typical urban scene has numerous people and vehicles with various behaviors paths coupled with rules of the road. Building a framework for predicting behaviors for path planning in such scenes is a difficult task. The frameworks for building algorithms in these scenes involve

- Sensors for Perception - RGB, LIDAR, Infra-red

- Control Algorithms - Motor commands

The planning algorithms have two components to them 

- Global planning - To plan the coarse waypoints from the source to the destination. Dijkstra's and A$^*$ search are typically used for these.

- Motion planning - To plan the control commands based on the environment between the waypoints. It involves behavior planning and path planning algorithms. Behavior planning involves predicting motion of objects on the road and analysing the traffic signs.  The path planning part involves generating multiple trajectories which are pruned down from the perception data (sorting them based on a cost function). 

## Behavior Planning

### State Diagram Algorithms

Some classical approaches for this problem involves state diagrams that have a deterministic policy based on symbolic descriptions of the world. Basically, think of these as complicated `if-else` structures. [Behavior Nets](https://ieeexplore.ieee.org/document/4290200/) is one of the state-of-the-art approaches in this realm.

However, these approaches are prone to errors due to sensor uncertainity, state uncertainiity, uncertain temporal evolution and occlusions. These are corrected using Markov Decision Processes

### Markov Decision Processing

They involve deterministic or stochastic policy within a framework that models uncertainty by evaluating the future. The MDPs are coupled with a risk-factor to make the optimal strategy the safe strategy. One such approach is listed in [Probabilistic MDP-behavior planning for cars](https://ieeexplore.ieee.org/document/6082928). However, these do not work quite well in dynamic world. Also, in dense scenes the dimensionality becomes very high making this approach unscalable. The number of agent vary as well which cannot be modeled completely using an MDP.

In [Behavior Planning at Urban Intersections through Hierarchical
 Reinforcement Learning](https://arxiv.org/pdf/2011.04697) the authors simply choose the nearest $5$ agents to model the algorithm and use an RL algorithm to plan the path. However, this approach is data hungry, requires simulators, has low data coverage and oversimplifies the information in dense scenes.

### Online Algorithms

In [Online Decision-Making for Scalable Autonomous Systems (MODIA)](https://www.ijcai.org/Proceedings/2017/664) the algorithm decomposes the dynamic scene into small decision problems for each agent in the environment. Each decision problem has a pre-defined MDP based on the class of the agent. After obtaining optimal actions from each of these problems, an *executor* finds the best action based on a *preference* function defined on a notion of safety. This way, the algorithm has a linearly-growing complexity and state abstractions which are explainable.

## Status-Quo

Taking a step back, we need to deal with dynamic and complex environments. We need to ensure the algorithms use limited computation power and work with the variety of sensors equipped in the vehicle.

We do not have a good behavior-realisitc simulator and sufficient human labor annotations (in academic labs). Without enough data, how do we build algorithms for planning? The AVL Lab at UCSD does the following -

- Collect rollouts - Data collection stack for behavior planning - point cloud maps, teleoperation platform that collects high and low-level control

- Training phase - Offline RL for each decision problem

- Real-world deployment - Online decision framework from MODIA.

This approach has many limitations. Since the number of states is very large, the state-transition matrix is very sparse, and this is not good for determining the optimal policy. These can be fixed using generative simulators (which do not work quite well cuurently) or bridging large dataset by outsourcing the data collection.
