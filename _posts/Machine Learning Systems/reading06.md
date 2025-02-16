# Distributed Training and Efficient Finetuning

The growth of machine learning is much faster than what hardware can catch up with. We cannot fit our models in a single GPU anymore, and we need to learn how to use distributed training systems to satisfy our training needs. 

Typically, we deal with large model sizes (10B+) and large dataset sizes (1T+ tokens while pre-training, 1M+ in supervised fine-tuning). The goal is to maximize *throughput* by using smart distributed training strategies, where each GPU worker only deals with the fraction od training state and date. The main strategies used for this are -

1.  **Data Parallelism** (DP) - Each GPU worker gets a fraction of the total mini-batch of data, and computes the gradients on that data. these are then averaged across the workers to update the weights. In the most basic form, each worker has a copy of model weights, optimizer state and gradients for the fraction of the data it's working on

2. **Model Parallelism** (MP, Vertical) - Models are *vertically sliced* with different layers placed on different GPUs. In the naïve form, the GPUs wait for the previous GPU to finish the computation. To improve this, people use **pipeline parallelism** where the execution is pipelined across micro-batches.

3. **Tensor Parallelism** (TP) - Each GPU processes only a slice of a tensor by *horizontally slicing* the model across GPU workers. Each worker process the same batch of data but for different activations. They exchange parts when needed.

These are the core strategies but there can be hybrid approaches based on the needs. 



## ZeRO-powered Data Parallelism

[DeepSpeed's ZeRO]([[1910.02054] ZeRO: Memory Optimizations Toward Training Trillion Parameter Models](https://arxiv.org/abs/1910.02054)) (Zero-Redundancy) is one of the most efficient and popular strategies for distributed training. It is a data parallelization strategy that leverages memory redundancy in data-parallel training and the inter-GPU connects to improve throughput. It comprises of two components - ZeRO-DP (data parallelism) and ZeRO-R (residual memory). The team has also proposed newer architectures such as ZeRO-Offload/Infinity (offloading computation to CPU/ NVMe disk) and ZeRO++ (with flexible multi-node training and quantized weights). 

It boasts up to 64x memory reduction for a specific example across different hardware setups and model sizes!

The base method is PyTorch DDP that has been described before. Each GPU worker has **a copy** of the model weights, optimizer state and gradients. To average the gradients, **all-reduce** step is used. All-reduce is a two-step approach - *reduce-scatter* operation to reduce different parts of the data on different processes and an *all-gather* operation to gather the reduced data on all the processes. It requires $$2\psi$$ amount of communication cost for $$\psi$$ number of parameters. The paper suggests three ways of doing this -

-  **ZeRO Stage 1 /** $$P_{os}$$ **(Optimizer state partitioning)** - The optimizer state is partitioned/sharded across the workers, with model weights and gradients replicated across all the workers. Previously, the all-reduce step gets the average gradient value across all the workers. Now, each worker updates the optimizer state with the Adam equations that is in it's partition.  The key savings come from using a sharded optimizer state rather than having copies. Recall that Adam optimizer uses 2x as many weight parameters as the model. 

- **ZeRO Stage 2 /** $$P_{os + g}$$ **(Optimizer State + Gradient Partitioning)** - As the name suggests the gradients are sharded along with the optimizer state. So each worker calculates its gradient and the gradients are averaged with reduce-scatter at the worker (instead of all-reduce). 

- **ZeRO Stage 3 /** $$P_{os + g}$$ **(Optimizer State + Gradient Partitioning)** - The partitioning of the model weights is done horizontally. That is, each layer of the model is split across the GPUs and there is a parameter communication on-demand. The communication volume increases (since there is an extra all-gather for model parameters, the communication becomes 3x the number of parameters). As a consequence, the memory consumption is cut down by the number of GPU workers $$N$$ which is huge! So if you have enough number of GPUs, you can get good savings on the memory.

These were the base methods. The authors proposed a wide-array of variations on top of this.

1. **ZeRO-R** - Improves on ZeRO-DP by reducing the memory consumptions by activations and managing memory fragmentation. It essentially shards the activations as well. it also uses some temporary buffers to store intermediate results during gradient accumulation and reduction across workers.

2. [**Zero-Offload**](https://arxiv.org/abs/2101.06840) - The idea is to offload optimizer and computation from GPUs to the host CPU. Back in 2021, this obtained magnitudes of higher performance over PyTorch DDP. CPU computation is much slower, so only the less-intensive operations are offloaded so that the total compute complexity stays the same. So, operations such as norm calculations, weight updates, etc are done on the CPU, while the forward and backward pass are done on the GPU. It works with all stages of ZeRO (1, 2 and 3).

3. **Zero-Infinity** - An improvement on the previous approach to allow offloading to disk and some more improvements to CPU offloading. It could fit 10-100T parameters on just one DGX-2 node! This method is specifically built on top of ZeRO-3, and they achieved 49 Tflops/GPU for a 20 trillion model spread across 512 GPUs. This is insane! 

4. [**ZeRO++**](https://arxiv.org/abs/2306.10209) - The latest improvement in this saga of approaches. The major changes are quantized weights (reduces communication by half), hierarchical partitioning (a hybrid sharing technique) and quantized gradients. 

## Fully-Sharded Data Parallel

FSDP is another data-parallelism technique aimed at improving memory efficiency with limited communication overhead. It's based on the previous approaches and has two sharding strategies - Full Sharding and Hybrid Sharding. 

- **Full-sharding** - Similar to ZeRO-3, the parameters, optimizer state and gradient are sharded across workers. 

    The high level procedure is -

> In forward path

> - Run all_gather to collect all shards from all ranks to recover the full parameter in this FSDP unit
> - Run forward computation
> - Discard parameter shards it has just collected

> In backward path

> - Run all_gather to collect all shards from all ranks to recover the full parameter in this FSDP unit
> - Run backward computation
> - Run reduce_scatter to sync gradients
> - Discard parameters

- **Hybrid Sharding** - It consists of both sharding and replication based on the tradeoff between communication latency and memory savings. This option is useful when the only way out is sharding parameters.

## Implementation in Practice

ZeRO and FSDP integrate well with existing architectures. ZeRO is implemented in Microsoft’s DeepSpeed library and is integrated into the 🤗 Accelerate library. FSDP is a part of PyTorch itself, and again has an integration in the 🤗 Accelerate library. 

Pipeline parallelism requires architectural changes in the forward pass of the model. For this, the best option right now is Megatron-LM that is discussed next. A recent update in 2024 pushed nanotron that has 3D parallelism support. 

## Efficient Fine-tuning

Some popular optimizations -

1. **Mixed precision** - It has been widely adopted form LLMs wherein there is a master copy that is updated from the gradients of quantized copies. 

2. **Parameter Efficient Fine Tuning (PEFT)** - Various methods to reduce the finetuning effort. 
   
   1. [LoRA](https://arxiv.org/abs/2106.09685) - Low-rank version of weight updates to the model parameters. Works as well as full fine-tuning.
   
   2. [$$IA^3$$](https://huggingface.co/docs/peft/conceptual_guides/ia3) - Injects trainable vectors into key, value and feed forward layers. Is working as well as LoRA with a lower order of parameters but requires more experimentation. 

3. **Flash-attention** - It is a fast, memory efficient, exact, IO-aware attention mechanism. [FlashAttention 2](https://tridao.me/publications/flash2/flash2.pdf) achieves 220+ TFLOPS on A100!  FlashAttention 1 achieved 124 TFLOPs before. However, these only support Ampere, Ada and Hopper NVIDIA GPUs and half prevision data types. 

4. **Gradient and Activation Checkpointing** - A technique wherein only a subset of intermediate activations are stored and others are recomputed when needed. However, it can slow down the training by 20% for $$O(\sqrt N)$$ memory savings. [Check this site](https://medium.com/tensorflow/fitting-larger-networks-into-memory-583e3c758ff9) for better info.

5. **Quantization** - Post-training quantization refers to savings at inference since weights don't change. During training, there can be updates with quantized parameters. [QLoRA](https://arxiv.org/abs/2305.14314) is one such technique that quantizes the base model and trains half precision low-rank weights on this. The throughput actually decreases due to the de-quantization step for each activation. Nevertheless, it can reach the performance of full fine-tuning.

6. **Gradient accumulation** - The intuition behind this approach is to run the network in micro-batches, accumulate the gradients across these micro-batches and update the model for a full batch-size. The idea is to get the same output as with large batches but with much lower memory consumption (the time increases accordingly). Larger batches usually have lower convergence time and the technique is especially useful when using multiple GPUs. However, one should be conservative with this approach. [A pre-transformers era paper](https://openreview.net/forum?id=H1oyRlYgg) showed larger batch sizes can reduces the generalization abilities of a model. 

## Summary

The final tips for training these large models from this article are -

> - BF16/ FP16 by default. BF16 comes with basically no other config parameters and usually without any overflow issues (as opposed to FP16, where you can get different results with different loss scaling factors and have more overflow issues because of smaller dynamic range), so it’s very convenient.
> 
> - Use (Q)LoRA with trainable parameters added to all the linear layers.
> 
> - Use Flash Attention if your GPU supports it. Currently, Flash Attention 2 is supported for Llama 2 and Falcon in HuggingFace, with other models requiring monkey patches.
> 
> - Use Gradient/Activation Checkpointing. This will reduce throughput slightly. If you’ve got Flash attention, gradient checkpointing might not be required (they use a selective gradient checkpointing in the softmax of the attention layer).
> 
> - Use an efficient sampler in your dataloader, like the [multi-pack sampler](https://github.com/imoneoi/multipack_sampler).
> 
> - If you have multiple GPUs, always try BF16 + LoRA + Gradient Checkpointing + DeepSpeed ZeRO 3 first. **Megatron stuff from the next part too**
> 
> - Use quantization when you have very limited GPU memory. QLoRA-style training currently works for DeepSpeed ZeRO 1/2 only. Thus, even though it is memory efficient when it comes to model parameters, you still have parameter redundancy with ZeRO 1/2, and you also get reduced throughput.
> 
> - With more and more GPUs (say 8 V100s or A100s), DS ZeRO-3 should be the way to go. DS ZeRO-2 is also good, but you can start to hit CPU RAM limits (during model initialization) because of model parameters being replicated across all workers.
> 
> - In a small-scale multi-node setup, with a few nodes, the best option seems to be DeepSpeed ZeRO-3 with hierarching partitioning enabled (or FSDP with hybrid sharding). If you’ve got Infiniband interconnect, you can mostly use plain DeepSpeed ZeRO-3 and push for larger model sizes as well.
> 
> - Gradient accumulation should be used if you’re still short on batch size after all the above optimizations. Training times with gradient accumulation can be faster with large models and multi-GPU/ multi-node settings.
> 
> - If you’re really short on GPU memory, then you would activate CPU/ disk offloading (and by disk, this has to be NVMe for ZeRO-Infinity). With the advent of Flash Attention 2, we need another study on the throughput gap between plain GPU-based training and GPU + NVMe/CPU-offloading. ZeRO-Infinity is better than ZeRO-Offload.
> 
> - Calculate the effective batch size and adjust hyperparameters accordingly. A general guideline is to scale up the learning rate with the effective batch size. This seems to hold true even for 100B+ models, [as seen in OpenAI’s finetuning docs](https://platform.openai.com/docs/guides/legacy-fine-tuning/hyperparameters).
> 
> - Finally, when you do start training, monitor `htop` to check on RAM usage (sometimes RAM OOM can be an issue), along with `nvidia-smi` to make sure GPUs aren’t bottlenecked by data preprocessing (you should aim for close to 100% volatile GPU utilization, even if GPU memory usage is lesser).
> 
> - Lower learning rate during pre-training works better in practice for GPT-3 and Bloom paper. The intuition/explanation for this effect is still pending.

# Megatron-LM

A simple model parallel approach that is orthogonal and complementary to pipeline model parallelism. They also show that larger models do indeed result in higher performance by demonstrating larger models trained with their approach.

Their approach exploits the inherent structure of transformer based language models that trains efficiently with PyTorch. Compared to the baseline that trains a 1.2 billion parameter model on a single NVIDIA V100 32GB GPU that sustains 39 TFLOPs (30% of the peak possible value), their method obtains 15.1 PetaFLOPs with an 8.3 billion model on 512 GPUs with 8-way parallelism - 76% scaling efficiency. 

The paper mentions the previous approaches *gradient accummulation* (Valiant, 1990) and *gradient/activation checkpointing* (Chen et. al., 2016), and that they are constrained to fit the model on a single GPU. They also mention that layer parallelism suffers from pipeline bubbles that reduce efficient or changes to the optimizer that impacts accuracy. Distributed tensor computation is a more general approach, and the authors use this technique for transformer's attention heads to parallelize. No framework, no compiler, simple PyTorch modifications.

## Model Parallel Transformers

The core idea is to parallelize the transformer architecture with some synchronization primitives. 

1. The MLP part is a GEMM followed by a GeLU non-linearity. 
   
   $$
     \begin{align*}
     Y &= GeLU(XA) \\
  &= GeLU (\begin{bmatrix} X_1 & X_2\end{bmatrix}\begin{bmatrix}A_1 \\A_2\end{bmatrix}) \\
  & \neq GeLU(X_1A_1) + GeLU(X_2A_2)
  \end{align*}
   $$
   
   The matrix $$A$$ can be split across rows and $$X$$ across columns. Due to the non-linearity of $$GeLU$$, this method would need a synchronization point before the non-linear layer. 
   
   The other approach is to split $$A$$ across columns, and then $$GeLU$$ can be applied independently. It doesn't require any synchronization point. 
   
   $$
   \begin{align*}
     Y &= GeLU(XA) \\
  &= GeLU (X \begin{bmatrix} A_1 & A_2\end{bmatrix}) \\
  &= GeLU(XA_1) + GeLU(XA_2)
  \end{align*}
   $$
   
   This approach splits both GEMMs in the MLP block across GPUs and requires a single all-reduce operation in the forward and backward passes. 

2. For the self-attention block, the partitioning of GEMMs is done in a similar column parallel fashion for $$K, Q, V$$. These outputs can directly be passed into the linear layer to parallelize across rows evading communication latency here as well. The final answers after the FFN can be fused within two all-reduce operations. 

Furthermore, since vocabulary sizes can be large, it is beneficial to parallelize the output embedding GEMM. However, since the output embedding layer shares weights with the input embedding, the input embedding matrix is also parallelized across the vocabulary dimension. These splits would add two all-reduce operations. However, in the output layer the all-gather operation can be optimized by fusing with the cross-entropy loss - reduces parameter communication from $$b\times s\times v$$ to $$b \times s$$. That is, communicating scalar losses instead of logits is a huge reduction in communication. 

The paper further reduces the communication by replicating dropouts, layer normalization, and residual connections across GPUs and only the results are communicated. 

> Specifically, each worker maintains duplicate copies of layer normalization parameters on each GPU, and run dropout and residual connection on the output of the model parallel region before feeding them as input to the next model parallel regions. To optimize the model, each worker optimizes its own set of parameters. Since all values are either local to or duplicated on a GPU, there is no need for communicating updated parameter values in this formulation.

## Conclusion

The authors provide comprehensive set of results to demonstrate their method with GPT-2 and BERT, showcasing that they are able to scale the compute much higher with these simple optimizations while achieving higher accuracy with larger models. They also found that BERT like models perform better with layer normalization. 




