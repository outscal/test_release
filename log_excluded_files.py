import glob
import os
from release import expand_exclude_paths, EXCLUDE_PATHS
def get_all_files(directory='.'):
    """Get all files and directories in the project recursively."""
    all_paths = set()
    for root, dirs, files in os.walk(directory):
        # Normalize path separators
        root = root.replace('\\', '/')
        if root.startswith('./'):
            root = root[2:]
        elif root == '.':
            root = ''
        # Add directories
        for d in dirs:
            if root:
                all_paths.add(f"{root}/{d}")
            else:
                all_paths.add(d)
        # Add files
        for f in files:
            if root:
                all_paths.add(f"{root}/{f}")
            else:
                all_paths.add(f)
    return all_paths
def normalize_path(path):
    """Normalize path for comparison."""
    return path.replace('\\', '/').rstrip('/')
def main():
    print('=' * 60)
    print('SELECTED FILES LOG')
    print('=' * 60)
    # Get all files in the project
    all_files = get_all_files()
    # Get excluded paths
    expanded_excluded = expand_exclude_paths(EXCLUDE_PATHS)
    normalized_excluded = {normalize_path(p) for p in expanded_excluded}
    # Filter out excluded files to get selected files
    selected_files = []
    for path in all_files:
        normalized = normalize_path(path)
        if normalized not in normalized_excluded:
            # Also check if any parent directory is excluded
            is_excluded = False
            for excluded in normalized_excluded:
                if normalized.startswith(excluded + '/') or normalized == excluded:
                    is_excluded = True
                    break
            if not is_excluded:
                selected_files.append(path)
    # Separate into directories and files
    selected_dirs = []
    selected_file_paths = []
    for path in sorted(selected_files):
        if os.path.isdir(path):
            selected_dirs.append(path)
        else:
              selected_file_paths.append(path)

    print()
    print(f'[SELECTED DIRECTORIES] ({len(selected_dirs)} items)')
    print('-' * 60)
    for path in selected_dirs:
        print(f'  [DIR]  {path}')
    print()
    print(f'[SELECTED FILES] ({len(selected_file_paths)} items)')
    print('-' * 60)
    for path in selected_file_paths:
        print(f'  [FILE] {path}')
    print()
    print('=' * 60)
    print(f'SUMMARY: {len(selected_dirs)} directories, {len(selected_file_paths)} files')
    print(f'TOTAL: {len(selected_files)} selected items')
    print(f'EXCLUDED: {len(expanded_excluded)} items')
    print('=' * 60)

if __name__ == '__main__':
    main()