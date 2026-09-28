'use client';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from './ui/button';
export function DeleteDialog({
  onConfirm,
  disabled = false,
  label = '削除',
}: {
  onConfirm: () => void;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="outline" className="danger" disabled={disabled}>
          {label}
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />
        <AlertDialog.Content className="dialog-content">
          <AlertDialog.Title>本当に削除しますか？</AlertDialog.Title>
          <AlertDialog.Description>
            削除したデータは復元できません。公開中のコンテンツはサイトからも削除されます。
          </AlertDialog.Description>
          <div className="dialog-actions">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">キャンセル</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button className="danger" variant="outline" onClick={onConfirm}>
                削除する
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
