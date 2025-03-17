# Flash Attention

One of the seminal papers that has significantly reduced the energy usage of these large transformer models. At the core of transformers is the attention mechanism that becomes a bottle neck for long sequences. Both the time and space complexity scale quadratically with the sequence length making it infeasible to work with long context. Some previous works tried to reduce these requirements using sparse-approximations, low-rank approximations and other niche techniques which did not gain traction. **The issue is that they reduce the FLOPs but because of the behavior of GPUs, this does not necessarily translate to optimized run-times.**

Flash Attention on the other hand leverages the various hierarchies in the GPUs to utilize the resources most efficiently (to their fullest extent) and reduce both time and space requirements. Due to the reduction of these requirements, they claim fast model training, higher quality models and SOTA attention speed. 

### Background

The GPU memory hierarchy has memory of different sizes and speeds. For example, the A100 GPU has 40-80GB of high bandwidth memory (HBM) with bandwidth 1.5-2.0TB/s and 192KB of on-chip SRAM per each of 108 streaming multiprocessors with bandwidth estimated around 19TB/s. 

![](/assets/img/Machine Learning Systems2025-03-10-19-19-19-image.png)

The on-chip SRAM is an order of magnitude faster than HBM but many orders of magnitude smaller in size. As compute has gotten faster relative to memory speed, operations are increasingly bottlenecked by memory
(HBM) accesses. With this motivations, the authors exploit fast SRAM for Flash Attention. 

As mentioned previously in these articles, GPU operations can be classified as compute bound (time is arithmetic operations dominant) or memory bound (time is memory access dominant). Memory bound operations have been optimized with the use of **kernel fusion** - multiple operations can be done with single load from HBM. It turns out that attention is a memory-bound operation since it mostly consists of element-wise operations. 

![](/assets/img/Machine Learning Systems2025-03-10-16-14-20-image.png)

In standard attention, the matrices $$S = QK^T$$ and $$P = \text{softmax}(S)$$ are explicitly calculated using up $$\mathcal O(N^2)$$ memory. In terms of GPU usage, it looks like this - 

1. Load $$Q, K$$ by blocks from HBM, compute $$S = QK^T$$, write $$S$$ **to HBM**.

2. Read $$S$$ **from HBM**, compute $$P = \text{softmax}(S)$$, write $$P$$ **to HBM**.

3. Load $$P$$ and $$V$$ by blocks **from HBM**, compute $$O = PV$$, write $$O$$ to HBM.

We shall now see how Flash Attention improves on this with **kernel fusion**

## Method

The main idea is that, like matrix multiplication, $$Q, K, V$$ can be split into blocks to load from slow HBM to fast SRAM. 

### Forward Pass

**Tiling**. The main hurdle in the previous works was getting softmax to work with tiling mechanisms. how can softmax be fused across blocks? Since we apply softmax across columns of $$K$$, for each column, we can maintain $$f(x) = e^{x - m(x)}, l(x) = \sum_i f(x)_i$$ to calculate the softmax as $$f(x)/l(x)$$ - they essentially keep track of the sum and maximum of elements (for numerically stable softmax). These two statistical quantities are calculated across blocks recursively all the way up to calculate the final softmax - forward pass of the flash attention algorithm.

![](/assets/img/Machine Learning Systems2025-03-10-19-25-38-image.png)

Let us dive into a bit more detail. The output matrix $$O$$ is stored in the HBM, and updates are made to store the correct output at the end of all block computations. For simplicity, let us consider blocks of sizes $$(n \times d)$$ where $$n$$ is some factor of $$N$$. 

1. In typical softmax $$O_ij = \underbrace{\sum_k Q_{ik} K_{kj}}_{S^i} \cdot V_j$$ (using superscript for row and subscript for column). In Flash attention, we pick up block $$Q_{b_i}$$ and $$K_{b_j}$$, perform the multiplication to obtain a sub-matrix $$S_{b_ib_j}$$ of size $$n \times n$$ and store
   
   1. $$m^k_{b_ib_j}$$  - The maximum value of each row vector.
   
   2. $$l^k_{b_ib_j}$$ - Sum of $$e^{S_{b_ib_j} - m^k}$$  across all the columns in each row

2. We compute the result $$f(S_{b_ib_j})V_{b_i}$$ with appropriate softmax values using the $$m, l$$ values and update the corresponding $$n \times d$$ block in $$O$$. Remember that this is the partial result and needs to updated with further calculations.

3. When another partial sum for the block in $$O$$, the entry can be easily updated with the new $$m, l$$ values (the math is super easy) to calculate the softmax of the complete partial sum so far.

Although the asymptotic time complexity is still the same, the constant associated would decrease significantly due to lower HBM accesses. The space usage increases by $$2*N$$ while dropping the intermediate results that occupy $$\mathcal O(N^2)$$! This is huge! The time computation becomes $$\mathcal O(N^2d^2 M^{-1})$$ where $$M$$ is the size of SRAM, as compared to $$\mathcal \Omega (Nd + N^2)$$. 

**Input:**

- Matrices $$Q, K, V \in \mathbb{R}^{N \times d}$$ in HBM.

- On-chip SRAM of size $$M$$.

- Softmax scaling constant $$\tau \in \mathbb{R}$$.

- Masking function $$mask$$.

- Dropout probability $$p_{drop}$$.

**Steps:**

1. Initialize the pseudo-random number generator state $$R$$ and save to HBM.

2. Set block sizes:

   - $$B_c = \left\lfloor \frac{M}{4d} \right\rfloor$$,

   - $$B_r = \min\left(\left\lfloor \frac{M}{4d} \right\rfloor, d'\right)$$.

3. Initialize in HBM:

   - $$O = (0)^{N \times d} \in \mathbb{R}^{N \times d}$$,

   - $$\ell = (0)^N \in \mathbb{R}^{N}$$,

   - $$m = (-\infty)^N \in \mathbb{R}^{N}$$.

4. Divide $$Q$$ into 

   $$T_r = \left\lceil \frac{N}{B_r} \right\rceil$$ blocks 

   $$Q_1, Q_2, \dots, Q_{T_r}$$ of size $$B_r \times d$$ each, and divide both $$K$$ and $$V$$ into 

   $$T_c = \left\lceil \frac{N}{B_c} \right\rceil$$ blocks 

   $$K_1, K_2, \dots, K_{T_c}$$ and 

   $$V_1, V_2, \dots, V_{T_c}$$ of size $$B_c \times d$$ each.

5. Divide:

   - $$O$$ into $$T_r$$ blocks $$O_1, O_2, \dots, O_{T_r}$$ of size $$B_r \times d$$ each,

   - $$\ell$$ into $$T_r$$ blocks $$\ell_1, \ell_2, \dots, \ell_{T_r}$$ of size $$B_r$$ each,

   - $$m$$ into $$T_r$$ blocks $$m_1, m_2, \dots, m_{T_r}$$ of size $$B_r$$ each.

6. **For** $$j = 1 \text{ to } T_c$$ **do:**

   1. Load $$K_j, V_j$$ from HBM to on-chip SRAM.

   2. **For** $$i = 1 \text{ to } T_r$$ **do:**

      1. Load $$Q_i, O_i, \ell_i, m_i$$ from HBM to on-chip SRAM.

      2. On-chip, compute  

         $$S_{ij} = \tau\, Q_i\, K_j^T \in \mathbb{R}^{B_r \times B_c}$$.

      3. On-chip, compute  

         $$S^{masked}_{ij} = mask(S_{ij})$$.

      4. On-chip, compute:

         - $$\tilde{m}_{ij} = \text{rowmax}(S^{masked}_{ij}) \in \mathbb{R}^{B_r}$$,

         - $$\tilde{P}_{ij} = \exp\Bigl(S^{masked}_{ij} - \tilde{m}_{ij}\Bigr) \in \mathbb{R}^{B_r \times B_c}$$ (pointwise),

         - $$\tilde{\ell}_{ij} = \text{rowsum}(\tilde{P}_{ij}) \in \mathbb{R}^{B_r}$$.

      5. On-chip, compute:

         - $$m^{new}_i = \max(m_i, \tilde{m}_{ij}) \in \mathbb{R}^{B_r}$$,

         - $$\ell^{new}_i = e^{\,m_i - m^{new}_i}\,\ell_i + e^{\,\tilde{m}_{ij} - m^{new}_i}\,\tilde{\ell}_{ij} \in \mathbb{R}^{B_r}$$.

      6. On-chip, compute  

         $$\tilde{P}^{dropped}_{ij} = dropout\Bigl(\tilde{P}_{ij},\, p_{drop}\Bigr)$$.

      7. Write to HBM:

         $$O_i \gets \text{diag}(\ell^{new}_i)^{-1}\Bigl(\text{diag}(\ell_i)\,e^{\,m_i - m^{new}_i}\,O_i + e^{\,\tilde{m}_{ij} - m^{new}_i}\,\tilde{P}^{dropped}_{ij}\,V_j\Bigr)$$.

      8. Write to HBM:

         $$\ell_i \gets \ell^{new}_i,\quad m_i \gets m^{new}_i$$.

   3. **End For** (over $$i$$).

7. **End For** (over $$j$$).

8. Return $$O, \ell, m, R$$.

### Block-Sparse FlashAttention

In vanilla attention mechanisms, a mask is typically applied to the output after all the intermediate computations are completed. If the matrices are manipulated during the calculations, we may underutilize the GPU and lead to a less efficient computation.

Flash Attention solves this problem to some extent - it defines block sparsity masks for each block and extends the previous algorithm by simply considering blocks that have non-zero mask! This speeds-up computations a lot!

### Backward Pass

**Recomputation.** Instead of explicitly storing the intermediate matrices, the authors suggest gradient checkpointing for backward pass of attention. Peculiarly, gradient checkpointing speed-up the backward computation due to lower HBM accesses even though the intermediate matrices have to be recomputed. 

Essentially, again, instead of storing $$P, S$$ both of which are $$\mathcal O(N^2)$$, we simply load $$K, Q, V$$ that have the size $$N \times d$$ and recompute the required results for backward pass. The key ideas for gradient computations are very similar to the forward pass (more complicated because of too many computations).

### Summary

In accordance with their claims, the authors show the following results - 

1. Fast models - BERT trains 15% faster and $$3\times$$ end-to-end speedup compared to typical architectures for GPT-2. Only $$1.7\times$$ speedup compared to Megatron-LM. 
   
   > Can FlashAttention be combined with Megatron-LM? I think so, need to read this up. 

2. Better Models with Longer Sequences - The context length of $$GPT-2$$ can now be increased $$4\times$$ and the training is still faster than Megatron-LM!

3. Benchmarking Attention - 
   
   ![](/assets/img/Machine Learning Systems2025-03-10-20-51-41-image.png)

So that concludes our analysis on FlashAttention. The authors also mention some limitations - 

1. Developing new CUDA kernels for each hardware! Projects like Triton and other DSLs like TVM are helping with these issues though. 

2. The authors did not discuss how to extend these techniques to distributed systems. Later works, [FlashierAttention](https://www.adept.ai/blog/flashier-attention) and [FlashAttention3](https://tridao.me/blog/2024/flash3/) extended this work to further improve the efficiency.

This is another good [blog](https://gordicaleksa.medium.com/eli5-flash-attention-5c44017022ad) explaining Flash Attention well. Look into this if what I wrote does not make sense!

# Paged Attention

Running LLM services is very expensive. It is imperative we ensure the LLM serving systems are efficient and have a high throughput. KVCache made a profound impact on the efficiency of LLMs by storing the previously generated keys and values during the decoding process. 

An LLM generates tokens in an autoregressive manner, and this sequential generation process makes the workload memory-bound. We need to efficiently manage memory to load more number of batches and increase the throughput.

In a serving system, typically 30% of the memory is used to store the states for the requests. The KVCache for these different requests are often stored precariously resulting in almost 60-80% of the storage going towards fragmentation and reservation spaces (since these tensors are stored in contiguous memory). As a result, the GPU is underutilized because the batch sizes are limited. 

![](/assets/img/Machine Learning Systems2025-03-12-19-41-41-image.png)

This work draws inspiration from OS memory management to improve the efficiency of KV Cache memory storage, resulting in storage of higher batches and consequently higher throughput. 

Contiguous memory storage has become a standard in deep learning systems. However, the dynamic nature of the tokens generated over time make the existing systems inefficient due to pre-allocation and not being able to share the memory. For example, decoding algorithms such as parallel sampling and beam search, the generated sequences partially share the KV cache and the current systems do not support memory sharing due to contiguous storage. 

PagedAttention addresses these limitations by storing KV cache in a flexible manner similar to OS virtual memory - with logical memory and pages. 

## Background

- **Batching multiple requests**. Since the input tokens and the generated tokens vary and are not known apriori, batching them together is a difficult task. However, the MLPs in the transformer layers are token-agnostic allowing different requests to be batched for this stage of the decoding process. In such manner, **continuous batching** is employed where the self-attention of the requests are processed independently on different GPUs and the requests are then merged for the forward pass through MLP.

- The lifetime of a request can be classified into prompt phase (where the prompt is processed as a whole) and the decoding phase (token generation in autoregressive manner). The prompt phase of the requests can be efficiently parallelized across GPUs.

- The size of the KV Cache grows very quickly. With more powerful GPUs, the FLOPs typically increase dramatically while the memory improves incrementally. Therefore, memory would be a significant bottleneck going forward. 

### Memory Management in KV Cache

![](/assets/img/Machine Learning Systems2025-03-12-20-06-37-image.png)

As we mentioned before, KV Cache is stored as a contiguous tensor, and a chunk of memory is pre-allocated statically irrespective of actual input or eventual output length of the request. As a result, there are three primary sources of memory wastage

1. Internal fragmentation - Over-provisioning for potential maximum sequence lengths

2. Reserved slots for future tokens. Although this maybe used in the future, it could be used now for holding other requests. 

3. External fragmentation from the memory allocator. 

## Method

PagedAttention allows storing continuous keys and values in non-contiguous memory space. It partitions KV cache of each sequence into KV blocks and each block contains the key and value vectors for a fixed number of tokens based on the *Block Size B*. During the attention computation, the PagedAttention kernel fetches different KV blocks separately. 

The memory manager is analogous to virtual memory in operating systems - the KV cache is represented as a series of logical KV blocks, filled from left to right. The unfilled positions on each row are reserved for future generations. On GPU workers, a block engine allocates a contiguous chunk of GPU DRAM and divides it into physical KV blocks and maintains block tables (mapping between logical and physical KV blocks). Note that the block size is an important hyperparameter that is a trade-off between spaces reserved for the future and the block table overhead. 

![](/assets/img/Machine Learning Systems2025-03-12-20-27-56-image.png)

> The whole reason we maintain contiguous blocks is to ensure faster retrieval, right?

New physical blocks are assigned only when all the previous blocks for a request are full. 

Due to the flexible nature of this memory management, other decoding techniques like parallel decoding, beam search and shared prefix become much more efficient. 

1. In parallel decoding a single physical block and be mapped to multiple logical blocks (tracked through a *reference count*). Here only the initial prompt blocks are shared

2. In beam search, blocks other than the prefill phase are shared and a block tree has to be generated similar to OS process tree. Previous systems maintained copies of KV cache for beam candidates and this technique prevents that.

3. In case of system prompts (usually very long), LLM service providers usually have a single copy for the tokens, and the same system can be adapted to PagedAttention as well

When the number of requests surpass the system's capacity, the authors adopt a FCFS policy. There are two main questions that need to be answered - 

1. What blocks need to be evicted? They use an all-eviction policy where all the blocks relating to a request are evicted.

2. How to recover evicted blocks? The evicted blocks are copied to the CPI memory, and swapped based on the requirement

They also adopt a recomputation technique if the latency is much lower. 



**Distributed Execution.** When multiple GPUs are present, the memory manager needs to be capable of handling distributed memory. They implement the memory management in a Megatron-LM style tensor model parallelism. Each model shard still processes the same set of input tokens, thus requiring the KV cache for the same positions - so a single KV cache manager within the centralized scheduler suffices. 



## Execution and Results

PagedAttention introduces memory access patterns that are not efficiently supported by the existing systems. They implemented their own GPU kernels 

1) Fused re-shape and block write

2) Fusing  block read and attention

3) Fused block copy

PagedAttention obtains significantly better throughput - It is able to handle 2-3x higher number of requests

![](/assets/img/Machine Learning Systems2025-03-12-20-45-50-image.png)

The authors also performed a detailed ablation study for

- Custom kernel operations - 20-26% lower latency

- Block size - If the block size is too small, vLLM
  may not fully utilize the GPU’s parallelism for reading and processing KV cache. If the block size is too large, internal fragmentation increases and the probability of sharing decreases![](/assets/img/Machine Learning Systems2025-03-12-20-47-22-image.png)

- Comparison of recomputation and swapping - depends on the PCIe bandwidth

## Conclusion

It must be noted that these techniques work well for LLMs because they are memory bound. In other words, other DNN workloads may not see similar improvements because they tend to be compute-bound. 

Furthermore, due to the significance of the transformer architecture, numerous specialized serving systems for it have been developed. There are other works like Orca that developed orthogonal techniques to improve GPU utilization. 


