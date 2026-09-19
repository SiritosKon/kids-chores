import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '@/shared/api/db';
import { bootstrap } from '@/app/model/bootstrap';
import { childrenCatalogue } from '@/entities/child';
import { tasksCatalogue } from '@/entities/task';
import { rewardsCatalogue } from '@/entities/reward';
import { getSettings } from '@/entities/settings';
import { saveDayMarks, getAllCompletions } from '@/entities/completion';
import { exportAll, importAll } from './backup';

beforeEach(async () => {
  if (db.isOpen()) {
    db.close();
  }
  await db.delete();
  await db.open();
  await bootstrap();
});

describe('экспорт и импорт', () => {
  it('выгружает каталоги и настройки, а не только историю', async () => {
    const backup = await exportAll();

    expect(backup.version).toBe(3);
    expect(backup.children).toHaveLength(2);
    expect(backup.tasks).toHaveLength(3);
    expect(backup.rewards).toHaveLength(7);
    expect(backup.settings?.bonus).toEqual({ enabled: true, points: 1 });
  });

  it('возвращает и правки каталога, и историю после полной очистки базы', async () => {
    const [child] = await childrenCatalogue.read();
    await childrenCatalogue.put({ ...child!, name: 'Переименован' });
    await saveDayMarks('timofey', '2026-09-16', [{ taskId: 'study', points: 1 }]);

    const backup = await exportAll();

    await db.delete();
    await db.open();
    await bootstrap();
    await importAll(backup);

    const children = await childrenCatalogue.read();
    expect(children.find((row) => row.id === child!.id)?.name).toBe('Переименован');
    expect(await getAllCompletions()).toHaveLength(1);
  });

  it('принимает старый файл без каталогов и не трогает их', async () => {
    await importAll({
      version: 2,
      completions: [
        {
          id: 'legacy-1',
          childId: 'daniil',
          taskId: 'reading',
          date: '2026-09-17',
          points: 1,
          createdAt: 1789670770550,
          updatedAt: 1789670770550,
        },
      ],
    });

    expect(await getAllCompletions()).toHaveLength(1);
    expect(await childrenCatalogue.read()).toHaveLength(2);
    expect(await tasksCatalogue.read()).toHaveLength(3);
    expect(await rewardsCatalogue.read()).toHaveLength(7);
    expect(await getSettings()).toBeDefined();
  });
});
