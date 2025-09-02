import { useForm } from 'react-hook-form';
import { useCreateProduct, useRenameProduct } from '../hooks';

type Props = {
    initialName?: string;
    id?: string;
    onDone?: () => void;
};

export default function ProductForm({ initialName = '', id, onDone }: Props) {
    const { register, handleSubmit, reset } = useForm<{ name: string }>({ defaultValues: { name: initialName } });
    const createMut = useCreateProduct();
    const renameMut = useRenameProduct();

    const onSubmit = async ({ name }: { name: string }) => {
        if (!name.trim()) return;
        try {
            if (id) await renameMut.mutateAsync({ id, name: name.trim() });
            else await createMut.mutateAsync(name.trim());
            reset({ name: '' });
            onDone?.();
        } catch (e) {
        }
    };

    const loading = createMut.isPending || renameMut.isPending;

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="form" style={{ display: 'flex', gap: 8 }}>
            <input placeholder="Product name" {...register('name', { required: true })} disabled={loading} />
            <button className="btn btn--primary" type="submit" disabled={loading}>
                {id ? 'Save' : 'Add'}
            </button>
        </form>
    );
}
