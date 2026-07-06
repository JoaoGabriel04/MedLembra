-- RenameColumn: senha -> senha_hash para deixar claro que é hash, não texto plano
ALTER TABLE "Usuario" RENAME COLUMN "senha" TO "senha_hash";
