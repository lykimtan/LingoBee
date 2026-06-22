from transformers import AutoProcessor, AutoModelForCausalLM, PreTrainedModel
import torch
PreTrainedModel._supports_sdpa = False
print('Loading model...')
model_id = 'microsoft/Florence-2-base-ft'
processor = AutoProcessor.from_pretrained(model_id, trust_remote_code=True)
model = AutoModelForCausalLM.from_pretrained(model_id, torch_dtype=torch.float32, trust_remote_code=True)
print('Success!')
