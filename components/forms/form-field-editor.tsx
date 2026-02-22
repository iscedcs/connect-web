'use client';

import { ToggleIcon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface FormField {
	id: string;
	type:
		| 'text'
		| 'textarea'
		| 'number'
		| 'email'
		| 'date'
		| 'select'
		| 'radio'
		| 'checkbox';
	label: string;
	name: string;
	required: boolean;
	options?: string[];
	validations?: {
		max?: number;
		min?: number;
	};
}

export default function FormFieldEditor({
	field,
	onChange,
	onDelete,
}: {
	field: FormField;
	onChange: (updated: FormField) => void;
	onDelete: (id: string) => void;
}) {
	const update = (key: keyof FormField, value: any) => {
		onChange({ ...field, [key]: value });
	};

	const updateValidation = (
		key: 'min' | 'max',
		value: number | undefined,
	) => {
		onChange({
			...field,
			validations: { ...field.validations, [key]: value },
		});
	};

	const addOption = () => {
		const opts = field.options ? [...field.options] : [];
		opts.push('');
		update('options', opts);
	};

	const updateOption = (index: number, value: string) => {
		const opts = [...(field.options || [])];
		opts[index] = value;
		update('options', opts);
	};

	const deleteOption = (index: number) => {
		const opts = [...(field.options || [])];
		opts.splice(index, 1);
		update('options', opts);
	};

	const isChoiceField =
		field.type === 'select' ||
		field.type === 'radio' ||
		field.type === 'checkbox';

	return (
		<div className='bg-neutral-900/60 border border-white/10 rounded-xl p-4 space-y-4 animate-fadeIn'>
			{/* HEADER */}
			<div className='flex justify-between items-center'>
				<h3 className='font-medium'>
					Field: {field.label || 'Untitled'}
				</h3>
				<Button
					variant='ghost'
					size='icon'
					onClick={() => onDelete(field.id)}
					className='hover:bg-red-500/20'
				>
					<X className='w-4 h-4 text-red-400' />
				</Button>
			</div>

			{/* LABEL */}
			<div>
				<label className='text-sm text-white/60'>Label</label>
				<input
					type='text'
					value={field.label}
					onChange={(e) => update('label', e.target.value)}
					className='w-full p-2 bg-neutral-800 border border-white/10 rounded-lg mt-1'
					placeholder='Full Name'
				/>
			</div>

			{/* NAME */}
			<div>
				<label className='text-sm text-white/60'>Field Name</label>
				<input
					type='text'
					value={field.name}
					onChange={(e) => update('name', e.target.value)}
					className='w-full p-2 bg-neutral-800 border border-white/10 rounded-lg mt-1'
					placeholder='full_name'
				/>
			</div>

			{/* FIELD TYPE */}
			<div>
				<label className='text-sm text-white/60'>Field Type</label>
				<select
					title='field type'
					value={field.type}
					onChange={(e) => update('type', e.target.value)}
					className='w-full p-2 bg-neutral-800 border border-white/10 rounded-lg mt-1'
				>
					<option value='text'>Text</option>
					<option value='textarea'>Textarea</option>
					<option value='number'>Number</option>
					<option value='email'>Email</option>
					<option value='date'>Date</option>
					<option value='select'>Select (Dropdown)</option>
					<option value='radio'>Radio</option>
					<option value='checkbox'>Checkbox</option>
				</select>
			</div>

			{/* REQUIRED */}
			<div className='flex items-center justify-between pt-2'>
				<span className='text-sm text-white/70'>Required</span>
				<ToggleIcon
					checked={field.required}
					onCheckedChange={(val) => update('required', val)}
				/>
			</div>

			{/* OPTIONS (Choice fields only) */}
			{isChoiceField && (
				<div className='space-y-2'>
					<div className='flex justify-between'>
						<h4 className='text-sm font-medium'>Options</h4>
						<Button
							variant='secondary'
							size='sm'
							onClick={addOption}
						>
							+ Add Option
						</Button>
					</div>

					{(field.options || []).map((opt, idx) => (
						<div
							key={idx}
							className='flex gap-2'
						>
							<input
								value={opt}
								onChange={(e) =>
									updateOption(idx, e.target.value)
								}
								className='flex-1 p-2 bg-neutral-800 border border-white/10 rounded-lg'
								placeholder={`Option ${idx + 1}`}
							/>
							<Button
								variant='ghost'
								size='icon'
								onClick={() => deleteOption(idx)}
							>
								<X className='w-4 h-4 text-white/40' />
							</Button>
						</div>
					))}
				</div>
			)}

			{/* VALIDATIONS */}
			<div className='space-y-3 pt-2'>
				<h4 className='text-sm font-medium'>Validation</h4>

				<div>
					<label className='text-xs text-white/50'>Min</label>
					<input
						title='Minimum value'
						type='number'
						value={field.validations?.min || ''}
						onChange={(e) =>
							updateValidation(
								'min',
								e.target.value ?
									Number(e.target.value)
								:	undefined,
							)
						}
						className='w-full p-2 bg-neutral-800 border border-white/10 rounded-lg'
					/>
				</div>

				<div>
					<label className='text-xs text-white/50'>Max</label>
					<input
						title='Maximum value'
						type='number'
						value={field.validations?.max || ''}
						onChange={(e) =>
							updateValidation(
								'max',
								e.target.value ?
									Number(e.target.value)
								:	undefined,
							)
						}
						className='w-full p-2 bg-neutral-800 border border-white/10 rounded-lg'
					/>
				</div>
			</div>
		</div>
	);
}
