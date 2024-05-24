---

layout: post
title: Evaluating interactions in music
categories: [Research]
excerpt: Capturing the quantifiers required to comment on how well two pieces of music complement each other.
toc: 
sidebar: true

---

How do we identify how well two pieces of music complement each other? From notes, scales, rhythms, chords, time signatures, and many more abstract concepts associated with music, it is an interesting problem to capture the interactions between music pieces. This problem requires concepts from signal processing

How is music represented? A Mel spectrogram is used to represent frequencies across time with amplitudes for audio files. A MIDI file is a tabular description of beats, positions, pitch, durations and instruments. These tabular instances can easily be converted to vector representations using one-hot encodings and feature normalization. 

Using such representations, the paper [Multitrack Music Transformer](https://arxiv.org/abs/2207.06983) attempts to capture the interactions with attention mechanisms in a transformer. To understand this better, let us look at some theory.

### Total Information Flow

The total information flow is the sum of transfer entropies from $X$ to $Y$ and $Y$ to $X$. 

$$
T_{X \to Y} + T_{Y \to X} = H(X \vert \bar X) + H(Y \vert \bar Y) - H(XY \vert \bar{XY})
$$

If the combined sequence $XY$ does not make sense musically, then it will have a higher entropy, leading to lower total information flow. This concept is explored in depth in this context in this paper - [Evaluating Co-Creativity using Total Information Flow](https://arxiv.org/abs/2402.06810).

### Conditional Entropy

Represented as $H(Y \vert X)$ it measures how unpredicatble $Y$ is, given that we have $X$. How is this useful? A pre-trained music transformer is used to model $p(X \vert \bar X)$ which represents the probability of a particular *token* (next part of music) after seeing a particular set of tokens (music till that point).

## Research

Using the features from a MIDI file directly would not yield the best results. It composes of monotonically increasing data (beat), categorical features (instruments) and repeated values (position).

This problem can also be posed as a Reinforcement Learning Problem - using total information flow as a reward. For example, [RL-Duet: Online Music Accompaniment Generation Using Deep Reinforcement Learning](https://arxiv.org/abs/2002.03082) formulated a Deep RL algorithm for online accompaniment generation. The generation agent learns a policy to generate a musical note (action) based on previously generated context (state). RL has potential for real-time human-machine duel improvisation.

# RL-Duet

What is the goal? Create an agent that can generate music *interactively* with a human. Again, this is done via Symbolic MIDI pitch + beat. The earlier approaches used GANs which have large data requirements and usntable training. Another approach, using Gibbs sampling, iteratively modifies the music fragments based on the previous context. However, this approach cannot be done in an online fashion.

Typical approaches in reinforcement learning for sequence generation use maximum likelihood estimation. However, to improve the perceptual quality, global coherence and harmony, specific hand-crafted music rules-based rewards work much better.

The work in RL-Duet captures the horizontal temporal consistency and vertical harmony relations for the reward function of the RL-agent. The current state is the previously generated context (by both human and the agent) and the action as mentioned before is symbolic MIDI (note and pitch). This involves horizontal view (like linear bi-directional language modeling in NLP), vertical part, joint modeling and hand-crafted rewards. 
