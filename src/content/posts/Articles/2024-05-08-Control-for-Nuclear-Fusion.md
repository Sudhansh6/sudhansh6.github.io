---

layout: post
title: Reinforcement Learning in Nuclear Fusion
categories: [Research]
excerpt: Introduction to reinforcement learning algorithms for control in nuclear fusion reactors
toc: 
sidebar: true

---

# Introduction

What is Nuclear fusion? A process where lighter nuclei combine to form heavier atoms. It is of interest to researchers because of its potential to provide clean and long-term energy source. Humans are able to (atleast trying) perform these reactions by carefully controlling plasma through magnetic fields. Plasma is a state of matter where the electrons are stripped from their atoms past a certain temperature. These are extremely hot and require precisely controlled magnetical fields to be stored.

## Fusion Methods

There are two methods through which nuclear fusion is being performed currently - 

- Inertial Confinement Fusion (ICF)
  
  - These facilities tend to be very large, and are impractical to scale.

- Magnetic Confinement Fusion (MCF)
  
  - The goal is to confine hot plasma without touching walls. The device used for this is called as a **tokamak** that uses a central solenoid and induced current to control the magnetic fields.

### Tokamak

It's a sonu shaped device with a central solenoid that generates toroidal and poloidal magnetic fields to confine plasma and maintain high temperatures. Through these fields we want to control the radial position, vertical extent and overall shape of the plasma which is important for the fusion reactions.

Recently, KSTAR in South Korea was able to confine plasma for about a minute which is an impressive result for the current sota. In a huge international effort, ITER (International Thermonuclear Experimental Reactor), the world's largest tokamak is currently being built in Southern France. 

### Controls Engineering Process

- **Feedforward stage** - Find the ideal setting for fusion experiment objectives - precompute coil curents, plasma shape, etc.

- **Feedback control stage** - Closed loop control with magnetic measurements to determine the state of the plasma. Maintaining the required state boils down to solving a nonlinear PDE.

## Better control

Tradtional algorithms are able to control the vertical position of the plasma really well but they can be improved for radial control and are a result of intricately designed controllers stiched together. A black-box AI solution shows promise as a single control policy for more robust non-linear control. However, there can be a lack of performance guarantees along with non-interpretability with AI algorithms.

To emphasise on safety certifications, there has been works using Lyapunov functions.

### Stability Guarantees

**Lyapunov** functions are scalar functions used to verify stability of a system by modeling evolution of system moving from one energy level to another. Recently, work in Neural Lyapunov controls has extended these stability guarantees with the use of neural networks.

### Deep Reinforcement Learning Approaches

"[Magnetic control of tokamak plasmas through deep reinforcement learning](https://www.nature.com/articles/s41586-021-04301-9)" by Degrace aims to provide a solution for feedback control stage by estimating the current state using various measurements. The challenge arises in modelling such a high-dimensional space - 92 system measurements (poloidal coil currents, flux loops, magnetic probes) and the actions are continuous (19 control coil voltages) and also the absence of a good simulator for this problem.

The authors use a simulated environment which is implemented using a Forward FRad-Shafranov solve (FGE). Their algorithm was able to maintain different shapes of the plasma which is not possible with conventional algorithms.

Another paper by KSTAR - [Development of an operation trajectory design algorithm for control of multiple 0D parameters using deep reinforcement learning in KSTAR](https://iopscience.iop.org/article/10.1088/1741-4326/ac79be) - used *TD3* (RL algorithm) for feedforward controls. That is, to estimate the desired state of plasma required for the experiments. The states capture "how well the fusion reaction is going", the safety indices, etc to determine the required controls.

Interestingly, instead of a physics-based simulator, they used a data-based simulator trained using an LSTM network on around 5 years of data. 

## Current Work

**Neural Lyapunov control** - Roughly, we want to generate a lyapunov risk formulation for the fusion environment. The challenge is the for the fusion environment, we do not know the system dynamics, and we want to build a neural approximation for estimating this value. This can then be used for the lyapunov risk, which can finally be used for the control algorithms *with safety guarantees*. In summary, we are trying to improve the above papers by embedding safety guarantees with the methods.
